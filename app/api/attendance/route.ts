import { NextResponse } from "next/server";
import { mapAttendanceDashboard } from "@/lib/vtop/map-attendance";
import { fetchVtopAttendance } from "@/lib/vtop/fetch-attendance";
import { defaultSemesterId } from "@/lib/vtop/config";
import { getBridgeSessionToken, getVtopSession } from "@/lib/vtop/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const bridge = await getBridgeSessionToken();
  if (bridge) {
    return NextResponse.json({ error: "Use direct VTOP login for attendance." }, { status: 501 });
  }

  const session = await getVtopSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to VTOP to view attendance." }, { status: 401 });
  }

  const semesterId = new URL(request.url).searchParams.get("semester") ?? defaultSemesterId();

  try {
    const rows = await fetchVtopAttendance(session, semesterId);
    return NextResponse.json(mapAttendanceDashboard(rows));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load attendance.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
