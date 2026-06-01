import { NextResponse } from "next/server";
import {
  BRIDGE_CHALLENGE_COOKIE,
  PRELOGIN_COOKIE,
  SESSION_COOKIE,
  cookieOptions
} from "@/lib/vtop/session";

export async function POST(request: Request) {
  const secure = new URL(request.url).protocol === "https:";
  const cleared = cookieOptions(secure, 0);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", cleared);
  response.cookies.set(PRELOGIN_COOKIE, "", cleared);
  response.cookies.set(BRIDGE_CHALLENGE_COOKIE, "", cleared);
  response.cookies.set("campusly_vtop_demo", "", cleared);
  response.cookies.set("campusly_vtop_captcha", "", cleared);
  return response;
}
