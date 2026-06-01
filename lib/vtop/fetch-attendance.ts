import * as cheerio from "cheerio";
import { joinCookies, vtopClient } from "@/lib/vtop/client";
import type { VtopSession } from "@/lib/vtop/types";

export type VtopAttendanceLog = {
  date: string;
  status: string;
};

export type VtopAttendanceRow = {
  courseCode: string;
  courseTitle: string;
  slotName: string;
  faculty: string | null;
  attendedClasses: number | null;
  totalClasses: number | null;
  attendancePercentage: string | null;
  logs: VtopAttendanceLog[] | null;
};

export async function fetchVtopAttendance(
  session: VtopSession,
  semesterId: string
): Promise<VtopAttendanceRow[]> {
  const client = vtopClient();
  const cookieHeader = session.cookies;

  const listRes = await client.post(
    "/vtop/processViewStudentAttendance",
    new URLSearchParams({
      authorizedID: session.authorizedID,
      semesterSubId: semesterId,
      _csrf: session.csrf,
      x: Date.now().toString()
    }).toString(),
    {
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://vtopcc.vit.ac.in/vtop/open/page"
      }
    }
  );

  const $ = cheerio.load(listRes.data);
  const parsed: Array<VtopAttendanceRow & { detailOnclick?: string }> = [];

  $("#getStudentDetails table tbody tr").each((_, row) => {
    const cols = $(row).find("td");
    if (cols.length < 10) return;

    const slotCell = cols.eq(4).text().trim();
    const codeCell = cols.eq(1).text().trim();
    const courseCode = slotCell.startsWith("L") ? `${codeCell}(L)` : `${codeCell}(T)`;

    parsed.push({
      courseCode,
      courseTitle: cols.eq(2).text().trim(),
      slotName: slotCell,
      faculty: cols.eq(5).text().replace(/\s+/g, " ").trim() || null,
      attendedClasses: parseInt(cols.eq(9).text().trim(), 10) || null,
      totalClasses: parseInt(cols.eq(10).text().trim(), 10) || null,
      attendancePercentage: cols.eq(11).text().trim() || null,
      logs: null,
      detailOnclick: cols.eq(13).find("a").attr("onclick")
    });
  });

  return Promise.all(
    parsed.map(async ({ detailOnclick, ...course }) => {
      if (!detailOnclick) return course;

      const match = detailOnclick.match(/processViewAttendanceDetail\('([^']+)','([^']+)'\)/);
      if (!match) return course;

      const [, classId, slotName] = match;

      try {
        const detailRes = await client.post(
          "/vtop/processViewAttendanceDetail",
          new URLSearchParams({
            _csrf: session.csrf,
            authorizedID: session.authorizedID,
            x: Date.now().toString(),
            classId,
            slotName
          }).toString(),
          {
            headers: {
              Cookie: cookieHeader,
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        );

        const $$ = cheerio.load(detailRes.data);
        const logs: VtopAttendanceLog[] = [];

        $$("table.table tr").each((i, detailRow) => {
          if (i === 0) return;
          const detailCols = $$(detailRow).find("td");
          if (detailCols.length < 5) return;
          logs.push({
            date: detailCols.eq(1).text().trim(),
            status: detailCols.eq(4).text().trim()
          });
        });

        return { ...course, logs };
      } catch {
        return course;
      }
    })
  );
}
