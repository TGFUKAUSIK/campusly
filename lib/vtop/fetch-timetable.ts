import * as cheerio from "cheerio";
import { vtopClient } from "@/lib/vtop/client";
import type { VtopSession } from "@/lib/vtop/types";

export type VtopCourseRow = {
  courseCode: string;
  course: string;
  slotName: string;
  slotVenue: string;
  facultyDetails: string;
  LTPJC: string;
};

export async function fetchVtopTimetableCourses(session: VtopSession, semesterId: string): Promise<VtopCourseRow[]> {
  const client = vtopClient();
  const ttRes = await client.post(
    "/vtop/processViewTimeTable",
    new URLSearchParams({
      authorizedID: session.authorizedID,
      semesterSubId: semesterId,
      _csrf: session.csrf,
      x: Date.now().toString()
    }).toString(),
    {
      headers: {
        Cookie: session.cookies,
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://vtopcc.vit.ac.in/vtop/open/page"
      }
    }
  );

  const $ = cheerio.load(ttRes.data);
  const courseInfo: VtopCourseRow[] = [];

  $("table.table").each((_, table) => {
    $(table)
      .find("tbody tr")
      .each((__, row) => {
        const cells = $(row).find("td");
        if (cells.length < 8) return;

        const title = $(cells[2]).text().trim();
        const slotVenue = $(cells[7]).text().trim();
        const baseCode = title.split(" ")[0] ?? title;
        const courseCode = slotVenue.startsWith("L") ? `${baseCode}(L)` : `${baseCode}(T)`;

        courseInfo.push({
          course: title,
          courseCode,
          slotName: slotVenue,
          slotVenue,
          facultyDetails: $(cells[8]).text().trim(),
          LTPJC: $(cells[3]).text().trim()
        });
      });
  });

  return courseInfo;
}
