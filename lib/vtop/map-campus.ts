import type {
  AcademicSubject,
  AssignmentItem,
  CampusData,
  ExamItem,
  GradeTrendPoint,
  StudentProfile
} from "@/lib/campus-data/types";
import { mapAttendanceDashboard } from "@/lib/vtop/map-attendance";
import { buildNextFreeSlot, buildTodayClasses, buildWeekDays } from "@/lib/vtop/build-timetable";
import type { VtopCourseRow } from "@/lib/vtop/fetch-timetable";
import type { VtopMarkCourse } from "@/lib/vtop/fetch-marks";
import type { VtopSemesterGrade } from "@/lib/vtop/fetch-grades";
import type { VtopExamScheduleItem } from "@/lib/vtop/fetch-schedule";
import type { VtopAttendanceRow } from "@/lib/vtop/fetch-attendance";
import { semesterLabel } from "@/lib/vtop/config";

function parseScore(value: string): number {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapAssignments(courses: VtopMarkCourse[]): AssignmentItem[] {
  const items: AssignmentItem[] = [];

  for (const course of courses) {
    for (const assessment of course.assessments) {
      if (assessment.title.toLowerCase().includes("final assessment")) continue;
      const max = parseScore(assessment.maxMark);
      const scored = parseScore(assessment.scoredMark);
      const progress = max > 0 ? Math.min(100, Math.round((scored / max) * 100)) : 0;
      const priority: AssignmentItem["priority"] =
        progress < 40 ? "High" : progress < 75 ? "Medium" : "Low";

      items.push({
        title: assessment.title,
        subject: course.courseTitle,
        due: assessment.status || "Pending",
        priority,
        progress
      });
    }
  }

  return items.slice(0, 6);
}

function mapExams(schedule: VtopExamScheduleItem[]): ExamItem[] {
  const grouped = new Map<string, VtopExamScheduleItem[]>();

  for (const item of schedule) {
    const key = item.examType || "Exam";
    const list = grouped.get(key) ?? [];
    list.push(item);
    grouped.set(key, list);
  }

  const exams: ExamItem[] = [];

  for (const [title, entries] of grouped) {
    const first = entries[0];
    if (!first) continue;
    const examDate = new Date(first.examDate);
    const days = Number.isNaN(examDate.getTime())
      ? 0
      : Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    exams.push({
      title,
      date: first.examDate,
      detail: `${entries.length} courses`,
      days
    });
  }

  return exams.sort((a, b) => a.days - b.days);
}

function mapAcademicSubjects(grades: VtopSemesterGrade[], courses: VtopCourseRow[]): AcademicSubject[] {
  const creditByCode = new Map<string, number>();

  for (const course of courses) {
    const base = course.courseCode.replace(/\((L|T)\)$/, "");
    const credits = parseFloat(course.LTPJC.split(" ").pop() ?? "0");
    if (Number.isFinite(credits)) creditByCode.set(base, credits);
  }

  return grades.map((grade) => ({
    subject: grade.courseTitle,
    code: grade.courseCode,
    grade: grade.grade,
    score: grade.score,
    credits: creditByCode.get(grade.courseCode) ?? grade.credits
  }));
}

function mapGradeTrend(history: Array<{ semesterId: string; gpa: number | null }>): GradeTrendPoint[] {
  return history
    .filter((entry) => entry.gpa !== null)
    .slice(-6)
    .map((entry, index) => ({
      semester: `S${index + 1}`,
      gpa: entry.gpa ?? 0
    }));
}

export function mapCampusData(input: {
  sessionRegNo: string;
  semesterId: string;
  attendanceRows: VtopAttendanceRow[];
  timetableCourses: VtopCourseRow[];
  marksCourses: VtopMarkCourse[];
  cgpa?: string;
  creditsEarned?: string;
  semesterGrades: VtopSemesterGrade[];
  gradeHistory: Array<{ semesterId: string; gpa: number | null }>;
  examSchedule: VtopExamScheduleItem[];
}): CampusData {
  const now = new Date();
  const attendance = mapAttendanceDashboard(input.attendanceRows);
  const todayClasses = buildTodayClasses(input.timetableCourses, now);
  const cgpa = parseFloat(input.cgpa ?? "0");

  const student: StudentProfile = {
    name: input.sessionRegNo,
    firstName: input.sessionRegNo,
    registrationNumber: input.sessionRegNo,
    program: "VIT Chennai",
    semester: semesterLabel(input.semesterId),
    campus: "Vellore Campus",
    cgpa: Number.isFinite(cgpa) ? cgpa : 0,
    credits: parseInt(input.creditsEarned ?? "0", 10) || 0
  };

  return {
    ...attendance,
    student,
    todayClasses,
    weekDays: buildWeekDays(now),
    assignments: mapAssignments(input.marksCourses),
    exams: mapExams(input.examSchedule),
    gradeTrend: mapGradeTrend(input.gradeHistory),
    academicSubjects: mapAcademicSubjects(input.semesterGrades, input.timetableCourses),
    timetableDateLabel: now.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    nextFreeSlot: buildNextFreeSlot(todayClasses, now)
  };
}
