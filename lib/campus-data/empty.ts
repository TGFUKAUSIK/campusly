import type { CampusData } from "@/lib/campus-data/types";

export const emptyCampusData: CampusData = {
  student: {
    name: "Student",
    firstName: "Student",
    registrationNumber: "",
    program: "VIT Chennai",
    semester: "Current semester",
    campus: "Vellore Campus",
    cgpa: 0,
    credits: 0
  },
  subjects: [],
  todayClasses: [],
  weekDays: [],
  weeklyAttendance: [
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 }
  ],
  overallAttendance: 0,
  attended: 0,
  conducted: 0,
  missed: 0,
  missable: 0,
  marginTitle: "Sign in required",
  marginHint: "Connect VTOP to load your campus data.",
  trendFooter: "No attendance data loaded yet.",
  assignments: [],
  exams: [],
  gradeTrend: [],
  academicSubjects: [],
  timetableDateLabel: "",
  nextFreeSlot: "—"
};
