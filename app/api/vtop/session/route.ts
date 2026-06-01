import { NextResponse } from "next/server";
import { getBridgeSessionToken, getVtopSession, hasActiveSession } from "@/lib/vtop/session";

export async function GET() {
  const active = await hasActiveSession();
  if (!active) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = await getVtopSession();
  if (session) {
    return NextResponse.json({
      authenticated: true,
      kind: "vtop",
      authorizedID: session.authorizedID
    });
  }

  const bridgeToken = await getBridgeSessionToken();
  if (bridgeToken) {
    return NextResponse.json({
      authenticated: true,
      kind: "bridge"
    });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
