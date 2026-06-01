import { defaultSemesterId } from "@/lib/vtop/config";
import { fetchVtopAttendance } from "@/lib/vtop/fetch-attendance";
import { fetchVtopExamSchedule } from "@/lib/vtop/fetch-schedule";
import { fetchVtopGradeHistory } from "@/lib/vtop/fetch-grade-history";
import { fetchVtopSemesterGrades } from "@/lib/vtop/fetch-grades";
import { fetchVtopMarks } from "@/lib/vtop/fetch-marks";
import { fetchVtopTimetableCourses } from "@/lib/vtop/fetch-timetable";
import { mapCampusData } from "@/lib/vtop/map-campus";
import type { VtopSession } from "@/lib/vtop/types";

export async function loadCampusFromVtop(session: VtopSession, semesterId = defaultSemesterId()) {
  const [attendanceRows, timetableCourses, marksBundle, semesterGrades, gradeHistory, examSchedule] =
    await Promise.all([
      fetchVtopAttendance(session, semesterId),
      fetchVtopTimetableCourses(session, semesterId),
      fetchVtopMarks(session, semesterId),
      fetchVtopSemesterGrades(session, semesterId),
      fetchVtopGradeHistory(session),
      fetchVtopExamSchedule(session, semesterId)
    ]);

  return mapCampusData({
    sessionRegNo: session.authorizedID,
    semesterId,
    attendanceRows,
    timetableCourses,
    marksCourses: marksBundle.courses,
    cgpa: marksBundle.cgpaInfo.cgpa,
    creditsEarned: marksBundle.cgpaInfo.creditsEarned,
    semesterGrades: semesterGrades.grades,
    gradeHistory,
    examSchedule
  });
}
