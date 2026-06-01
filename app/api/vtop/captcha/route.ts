import { NextResponse } from "next/server";
import { fetchVtopCaptcha } from "@/lib/vtop/captcha";
import { BRIDGE_CHALLENGE_COOKIE, PRELOGIN_COOKIE, cookieOptions, encodePrelogin } from "@/lib/vtop/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secure = new URL(request.url).protocol === "https:";
  const bridgeUrl = process.env.VTOP_BRIDGE_URL;
  const bridgeSecret = process.env.VTOP_BRIDGE_SECRET;

  if (bridgeUrl && bridgeSecret) {
    const bridgeResponse = await fetch(`${bridgeUrl.replace(/\/$/, "")}/captcha`, {
      cache: "no-store",
      headers: { "X-Campusly-Bridge-Secret": bridgeSecret }
    });
    const challengeToken = bridgeResponse.headers.get("X-Campusly-Challenge-Token");

    if (!bridgeResponse.ok || !challengeToken) {
      return new NextResponse("Unable to load the VTOP CAPTCHA.", { status: 502 });
    }

    const response = new NextResponse(await bridgeResponse.arrayBuffer(), {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": bridgeResponse.headers.get("Content-Type") ?? "image/png",
        "X-Content-Type-Options": "nosniff"
      }
    });
    response.cookies.set(BRIDGE_CHALLENGE_COOKIE, challengeToken, cookieOptions(secure, 60 * 5));
    return response;
  }

  const captcha = await fetchVtopCaptcha();
  if ("error" in captcha) {
    return new NextResponse(captcha.error, { status: 502 });
  }

  const response = new NextResponse(captcha.image, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": captcha.contentType,
      "X-Content-Type-Options": "nosniff"
    }
  });

  response.cookies.set(PRELOGIN_COOKIE, encodePrelogin(captcha.prelogin), cookieOptions(secure, 60 * 5));
  return response;
}
