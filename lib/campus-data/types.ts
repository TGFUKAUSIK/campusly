export type AttendanceSubject = {
  code: string;
  name: string;
  shortName: string;
  attended: number;
  total: number;
  color: string;
  trend: number[];
};

export type ClassItem = {
  time: string;
  endTime: string;
  title: string;
  code: string;
  room: string;
  faculty: string;
  type: "Lecture" | "Lab" | "Tutorial";
  color: string;
  active?: boolean;
};

export type StudentProfile = {
  name: string;
  firstName: string;
  registrationNumber: string;
  program: string;
  semester: string;
  campus: string;
  cgpa: number;
  credits: number;
};

export type AssignmentItem = {
  title: string;
  subject: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  progress: number;
};

export type ExamItem = {
  title: string;
  date: string;
  detail: string;
  days: number;
};

export type AcademicSubject = {
  subject: string;
  code: string;
  grade: string;
  score: number;
  credits: number;
};

export type GradeTrendPoint = {
  semester: string;
  gpa: number;
};

export type WeekDay = {
  day: string;
  date: string;
  active: boolean;
};

export type WeeklyAttendancePoint = {
  day: string;
  value: number;
};

export type AttendanceDashboardData = {
  overallAttendance: number;
  subjects: AttendanceSubject[];
  weeklyAttendance: WeeklyAttendancePoint[];
  attended: number;
  conducted: number;
  missed: number;
  missable: number;
  marginTitle: string;
  marginHint: string;
  trendFooter: string;
};

export type CampusData = AttendanceDashboardData & {
  student: StudentProfile;
  todayClasses: ClassItem[];
  weekDays: WeekDay[];
  assignments: AssignmentItem[];
  exams: ExamItem[];
  gradeTrend: GradeTrendPoint[];
  academicSubjects: AcademicSubject[];
  timetableDateLabel: string;
  nextFreeSlot: string;
};
