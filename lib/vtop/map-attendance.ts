import {
  calculateMissableClasses,
  calculateRequiredClasses
} from "@/lib/api/attendance";
import type { AttendanceDashboardData, AttendanceSubject } from "@/lib/campus-data/types";
import type { VtopAttendanceRow } from "@/lib/vtop/fetch-attendance";

const COLORS = ["#4f8f83", "#f09a7c", "#d5a847", "#8178bd", "#6b8cce", "#c77dab"];

function colorForCode(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i += 1) {
    hash = (hash + code.charCodeAt(i) * (i + 1)) % COLORS.length;
  }
  return COLORS[hash] ?? COLORS[0]!;
}

function shortName(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length <= 28) return trimmed;
  return `${trimmed.slice(0, 25)}…`;
}

function isPresent(status: string): boolean {
  const normalized = status.toLowerCase();
  return normalized.includes("present") || normalized.includes("on duty");
}

function parseVtopDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildTrend(logs: VtopAttendanceRow["logs"], fallback: number): number[] {
  if (!logs?.length) {
    return Array.from({ length: 6 }, () => fallback);
  }

  const recent = logs.slice(-12);
  const chunkSize = Math.max(1, Math.ceil(recent.length / 6));
  const trend: number[] = [];

  for (let i = 0; i < 6; i += 1) {
    const chunk = recent.slice(i * chunkSize, (i + 1) * chunkSize);
    if (!chunk.length) {
      trend.push(fallback);
      continue;
    }
    const present = chunk.filter((entry) => isPresent(entry.status)).length;
    trend.push(Math.round((present / chunk.length) * 100));
  }

  return trend;
}

function buildWeeklyAttendance(rows: VtopAttendanceRow[]): AttendanceDashboardData["weeklyAttendance"] {
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const buckets = new Map<string, { present: number; total: number }>();

  for (const row of rows) {
    if (!row.logs) continue;
    for (const log of row.logs) {
      const date = parseVtopDate(log.date);
      if (!date) continue;
      const key = log.date;
      const bucket = buckets.get(key) ?? { present: 0, total: 0 };
      bucket.total += 1;
      if (isPresent(log.status)) bucket.present += 1;
      buckets.set(key, bucket);
    }
  }

  const sortedDates = [...buckets.entries()]
    .map(([date, stats]) => ({ date, stats, parsed: parseVtopDate(date) }))
    .filter((entry) => entry.parsed)
    .sort((a, b) => (a.parsed!.getTime() > b.parsed!.getTime() ? 1 : -1))
    .slice(-6);

  if (!sortedDates.length) {
    return [
      { day: "Mon", value: 0 },
      { day: "Tue", value: 0 },
      { day: "Wed", value: 0 },
      { day: "Thu", value: 0 },
      { day: "Fri", value: 0 },
      { day: "Sat", value: 0 }
    ];
  }

  return sortedDates.map(({ parsed, stats }) => ({
    day: dayLabels[parsed!.getDay()] ?? "—",
    value: stats.total ? Math.round((stats.present / stats.total) * 100) : 0
  }));
}

function subjectHint(attended: number, total: number): string {
  const percentage = total ? Math.round((attended / total) * 100) : 0;
  if (percentage < 75) {
    const required = calculateRequiredClasses(attended, total);
    return `Attend next ${required}`;
  }
  const missable = calculateMissableClasses(attended, total);
  return `Can miss ${missable}`;
}

export function mapAttendanceDashboard(rows: VtopAttendanceRow[]): AttendanceDashboardData {
  const subjects: AttendanceSubject[] = rows
    .filter((row) => row.totalClasses && row.totalClasses > 0)
    .map((row) => {
      const attended = row.attendedClasses ?? 0;
      const total = row.totalClasses ?? 0;
      const percentage = total ? Math.round((attended / total) * 100) : 0;
      const baseCode = row.courseCode.replace(/\((L|T)\)$/, "");

      return {
        code: baseCode,
        name: row.courseTitle,
        shortName: shortName(row.courseTitle),
        attended,
        total,
        color: colorForCode(baseCode),
        trend: buildTrend(row.logs, percentage)
      };
    });

  const attended = subjects.reduce((sum, subject) => sum + subject.attended, 0);
  const conducted = subjects.reduce((sum, subject) => sum + subject.total, 0);
  const missed = Math.max(conducted - attended, 0);
  const overallAttendance = conducted ? Math.round((attended / conducted) * 100) : 0;
  const missable = calculateMissableClasses(attended, conducted);

  const marginTitle = overallAttendance >= 75 ? "Healthy margin" : "Below threshold";
  const marginHint =
    overallAttendance >= 75
      ? `You can miss ${missable} more classes and stay above 75%.`
      : `Attend ${calculateRequiredClasses(attended, conducted)} more classes to reach 75%.`;

  const trendFooter =
    overallAttendance >= 75
      ? `Overall attendance is ${overallAttendance}% across ${subjects.length} subjects.`
      : `Overall attendance is ${overallAttendance}%. Focus on subjects below 75%.`;

  return {
    overallAttendance,
    subjects,
    weeklyAttendance: buildWeeklyAttendance(rows),
    attended,
    conducted,
    missed,
    missable,
    marginTitle,
    marginHint,
    trendFooter
  };
}
