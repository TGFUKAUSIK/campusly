import * as cheerio from "cheerio";
import { vtopClient } from "@/lib/vtop/client";
import type { VtopSession } from "@/lib/vtop/types";

export type VtopMarkAssessment = {
  title: string;
  maxMark: string;
  weightagePercent: string;
  scoredMark: string;
  weightageMark: string;
};

export type VtopMarkCourse = {
  courseCode: string;
  courseTitle: string;
  courseType: string;
  slot: string;
  faculty: string;
  assessments: VtopMarkAssessment[];
};

export type VtopCgpaInfo = {
  cgpa?: string;
  creditsEarned?: string;
  creditsRequired?: string;
};

export async function fetchVtopMarks(session: VtopSession, semesterId: string) {
  const client = vtopClient();

  const marksRes = await client.post(
    "/vtop/examinations/doStudentMarkView",
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

  const $ = cheerio.load(marksRes.data);
  const courses: VtopMarkCourse[] = [];

  $("table.customTable > tbody > tr.tableContent").each((_, row) => {
    const cols = $(row).find("td");
    if (cols.length < 9) return;

    const course: VtopMarkCourse = {
      courseCode: cols.eq(2).text().trim(),
      courseTitle: cols.eq(3).text().trim(),
      courseType: cols.eq(4).text().trim(),
      faculty: cols.eq(6).text().trim().replace(/\s+/g, " "),
      slot: cols.eq(7).text().trim(),
      assessments: []
    };

    const nested = $(row).next("tr.tableContent");
    nested.find("table.customTable-level1 > tbody > tr.tableContent-level1").each((__, assessmentRow) => {
      const assessmentCols = $(assessmentRow).find("td");
      course.assessments.push({
        title: assessmentCols.eq(1).find("output").text().trim(),
        maxMark: assessmentCols.eq(2).find("output").text().trim(),
        weightagePercent: assessmentCols.eq(3).find("output").text().trim(),
        scoredMark: assessmentCols.eq(5).find("output").text().trim(),
        weightageMark: assessmentCols.eq(6).find("output").text().trim()
      });
    });

    if (course.assessments.length) courses.push(course);
  });

  const creditsRes = await client.post(
    "/vtop/get/dashboard/current/cgpa/credits",
    new URLSearchParams({
      authorizedID: session.authorizedID,
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

  const $$ = cheerio.load(creditsRes.data);
  const cgpaInfo: VtopCgpaInfo = {};

  $$(".list-group-item").each((_, el) => {
    const label = $$("span.card-title", el).text().trim();
    const value = $$("span.fontcolor3 span", el).text().trim();
    if (label.includes("Total Credits Required")) cgpaInfo.creditsRequired = value;
    else if (label.includes("Earned Credits")) cgpaInfo.creditsEarned = value;
    else if (label.includes("Current CGPA")) cgpaInfo.cgpa = value;
  });

  return { courses, cgpaInfo };
}
