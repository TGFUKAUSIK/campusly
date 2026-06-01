import * as cheerio from "cheerio";
import { vtopClient } from "@/lib/vtop/client";
import type { VtopSession } from "@/lib/vtop/types";

export type VtopExamScheduleItem = {
  examType: string;
  courseCode: string;
  courseTitle: string;
  examDate: string;
  examTime: string;
  venue: string;
};

export async function fetchVtopExamSchedule(session: VtopSession, semesterId: string) {
  const client = vtopClient();
  const scheduleRes = await client.post(
    "/vtop/examinations/doSearchExamScheduleForStudent",
    new URLSearchParams({
      authorizedID: session.authorizedID,
      semesterSubId: semesterId,
      _csrf: session.csrf
    }).toString(),
    {
      headers: {
        Cookie: session.cookies,
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://vtopcc.vit.ac.in/vtop/open/page"
      }
    }
  );

  const $ = cheerio.load(scheduleRes.data);
  const items: VtopExamScheduleItem[] = [];
  let currentExamType = "";

  $("table.customTable tr").each((_, row) => {
    const tds = $(row).find("td");
    if (tds.length === 1 && $(tds[0]).attr("colspan") === "13") {
      currentExamType = $(tds[0]).text().trim();
      return;
    }
    if ($(row).hasClass("tableHeader")) return;
    if (!$(row).hasClass("tableContent") || tds.length <= 1) return;

    items.push({
      examType: currentExamType,
      courseCode: $(tds[1]).text().trim(),
      courseTitle: $(tds[2]).text().trim(),
      examDate: $(tds[6]).text().trim(),
      examTime: $(tds[9]).text().trim(),
      venue: $(tds[10]).text().trim()
    });
  });

  return items;
}
