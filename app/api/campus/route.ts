import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncCampusCache } from "@/lib/supabase/sync-campus";
import { loadCampusFromVtop } from "@/lib/vtop/load-campus";
import { getBridgeSessionToken, getVtopSession } from "@/lib/vtop/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const bridge = await getBridgeSessionToken();
  if (bridge) {
    return NextResponse.json(
      { error: "Direct VTOP login is required. Bridge sessions cannot load campus data yet." },
      { status: 501 }
    );
  }

  const session = await getVtopSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to VTOP to load campus data." }, { status: 401 });
  }

  try {
    const campus = await loadCampusFromVtop(session);
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (authData.user) {
      await syncCampusCache(authData.user.id, session.authorizedID, campus);
    }

    return NextResponse.json(campus);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load campus data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
