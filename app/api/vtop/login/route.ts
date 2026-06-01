import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { attachSupabaseAuthCookies } from "@/lib/supabase/attach-session";
import { ensureSupabaseUser } from "@/lib/supabase/provision-user";
import { syncCampusCache } from "@/lib/supabase/sync-campus";
import { loginToVtop } from "@/lib/vtop/login";
import { loadCampusFromVtop } from "@/lib/vtop/load-campus";
import {
  BRIDGE_CHALLENGE_COOKIE,
  PRELOGIN_COOKIE,
  SESSION_COOKIE,
  cookieOptions,
  getVtopPrelogin,
  serializeBridgeSession,
  serializeVtopSession
} from "@/lib/vtop/session";

const loginSchema = z.object({
  username: z.string().trim().min(3).max(64),
  password: z.string().min(1).max(256),
  captcha: z.string().trim().min(4).max(8)
});

export async function POST(request: Request) {
  const secure = new URL(request.url).protocol === "https:";
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your VTOP username, password, and CAPTCHA." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const bridgeUrl = process.env.VTOP_BRIDGE_URL;
  const bridgeSecret = process.env.VTOP_BRIDGE_SECRET;

  if (bridgeUrl && bridgeSecret) {
    const challengeToken = cookieStore.get(BRIDGE_CHALLENGE_COOKIE)?.value;
    if (!challengeToken) {
      return NextResponse.json({ error: "The CAPTCHA expired. Refresh it and try again." }, { status: 400 });
    }

    const bridgeResponse = await fetch(`${bridgeUrl.replace(/\/$/, "")}/session`, {
      body: JSON.stringify({ ...parsed.data, challengeToken }),
      headers: {
        "Content-Type": "application/json",
        "X-Campusly-Bridge-Secret": bridgeSecret
      },
      method: "POST"
    });
    const body = (await bridgeResponse.json().catch(() => ({}))) as { error?: string; sessionToken?: string };

    if (!bridgeResponse.ok || !body.sessionToken) {
      return NextResponse.json({ error: body.error ?? "VTOP rejected those credentials." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, authorizedID: parsed.data.username });
    response.cookies.set(SESSION_COOKIE, serializeBridgeSession(body.sessionToken), cookieOptions(secure));
    response.cookies.delete(PRELOGIN_COOKIE);
    response.cookies.delete(BRIDGE_CHALLENGE_COOKIE);
    return response;
  }

  const prelogin = await getVtopPrelogin();
  if (!prelogin) {
    return NextResponse.json({ error: "The CAPTCHA expired. Refresh it and try again." }, { status: 400 });
  }

  const result = await loginToVtop(parsed.data.username, parsed.data.password, parsed.data.captcha, prelogin);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 401 });
  }

  let campus;
  try {
    campus = await loadCampusFromVtop(result.session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load campus data after login.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const response = NextResponse.json({
    ok: true,
    authorizedID: result.session.authorizedID
  });
  response.cookies.set(SESSION_COOKIE, serializeVtopSession(result.session), cookieOptions(secure));
  response.cookies.delete(PRELOGIN_COOKIE);
  response.cookies.delete("campusly_vtop_demo");
  response.cookies.delete("campusly_vtop_captcha");

  try {
    const provisioned = await ensureSupabaseUser(result.session.authorizedID);
    if (provisioned.userId) {
      await syncCampusCache(provisioned.userId, result.session.authorizedID, campus);
      if (provisioned.email && provisioned.password) {
        await attachSupabaseAuthCookies(response, provisioned.email, provisioned.password);
      }
    }
  } catch {
    // Supabase is optional; VTOP session still works for live reads.
  }

  return response;
}
