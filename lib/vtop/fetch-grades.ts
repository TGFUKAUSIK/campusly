import * as cheerio from "cheerio";
import { vtopClient } from "@/lib/vtop/client";
import type { VtopSession } from "@/lib/vtop/types";

export type VtopSemesterGrade = {
  courseCode: string;
  courseTitle: string;
  grade: string;
  score: number;
  credits: number;
};

export async function fetchVtopSemesterGrades(session: VtopSession, semesterId: string) {
  const client = vtopClient();

  const resGrades = await client.post(
    "/vtop/examinations/examGradeView/doStudentGradeView",
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
        Referer: "https://vtopcc.vit.ac.in/vtop/examinations/examGradeView/StudentGradeView"
      }
    }
  );

  const $ = cheerio.load(resGrades.data);
  let gpa: number | null = null;
  const grades: VtopSemesterGrade[] = [];

  $("table.table-bordered tr").each((_, row) => {
    const cols = $(row).find("td");
    if ($(row).attr("align") === "center") {
      const match = $(row).text().trim().match(/GPA\s*:\s*([\d.]+)/i);
      if (match?.[1]) gpa = parseFloat(match[1]);
      return;
    }
    if (cols.length < 11) return;

    const score = parseFloat(cols.eq(9).text().trim());
    grades.push({
      courseCode: cols.eq(1).text().trim(),
      courseTitle: cols.eq(2).text().trim(),
      grade: cols.eq(10).text().trim(),
      score: Number.isFinite(score) ? score : 0,
      credits: 0
    });
  });

  return { gpa, grades };
}
