import campusConfig from "@/lib/vtop/campus-config.json";
import type { ClassItem, WeekDay } from "@/lib/campus-data/types";
import type { VtopCourseRow } from "@/lib/vtop/fetch-timetable";

const slotMap = campusConfig.slotMap as Record<string, Record<string, { time: string }>>;
const CLASS_COLORS = ["#dcefe8", "#ffe6df", "#f9efd8", "#e8e5f6", "#e6f0ff", "#fdeee8"];

function parseTimeRange(range: string) {
  const [start, end] = range.split("-").map((part) => part.trim());
  return { start: start ?? "", end: end ?? "" };
}

function toMinutes(value: string): number {
  const [hours = "0", minutes = "0"] = value.split(":");
  let hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  const isPm = hour === 12 || (hour >= 1 && hour <= 7);
  if (isPm && hour !== 12) hour += 12;
  if (!isPm && hour === 12) hour = 0;
  return hour * 60 + minute;
}

function formatClock(value: string): string {
  const minutes = toMinutes(value);
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const isPm = hour24 >= 12;
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${String(minute).padStart(2, "0")}`;
}

function classTypeFromSlot(slot: string): ClassItem["type"] {
  if (slot.startsWith("L")) return "Lab";
  if (slot.includes("T")) return "Tutorial";
  return "Lecture";
}

function cleanVenue(venue: string): string {
  const cleaned = venue.replace(/\s+/g, " ").trim();
  const matches = cleaned.match(/[A-Z]+\d*\s*-\s*\d+\s*[A-Z]?/g);
  return matches ? matches[matches.length - 1]! : cleaned;
}

export function buildWeekDays(reference = new Date()): WeekDay[] {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const start = new Date(reference);
  const dayIndex = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayIndex);

  return labels.map((day, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const active =
      date.getDate() === reference.getDate() &&
      date.getMonth() === reference.getMonth() &&
      date.getFullYear() === reference.getFullYear();
    return {
      day,
      date: String(date.getDate()),
      active
    };
  });
}

export function buildTodayClasses(courses: VtopCourseRow[], reference = new Date()): ClassItem[] {
  const weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][reference.getDay()] ?? "MON";
  const daySlots = slotMap[weekday] ?? {};
  const nowMinutes = reference.getHours() * 60 + reference.getMinutes();

  const entries: Array<ClassItem & { startMin: number }> = [];

  courses.forEach((course, index) => {
    const slots = course.slotName
      .split("+")
      .map((slot) => slot.trim())
      .filter(Boolean);

    for (const slot of slots) {
      const timing = daySlots[slot]?.time;
      if (!timing) continue;
      const { start, end } = parseTimeRange(timing);
      const startMin = toMinutes(start);
      const endMin = toMinutes(end);
      const baseCode = course.courseCode.replace(/\((L|T)\)$/, "");

      entries.push({
        time: formatClock(start),
        endTime: formatClock(end),
        title: course.course,
        code: baseCode,
        room: cleanVenue(course.slotVenue),
        faculty: course.facultyDetails,
        type: classTypeFromSlot(slot),
        color: CLASS_COLORS[index % CLASS_COLORS.length]!,
        startMin,
        active: nowMinutes >= startMin && nowMinutes <= endMin
      });
    }
  });

  return entries
    .sort((a, b) => a.startMin - b.startMin)
    .map(({ startMin: _startMin, ...item }) => item);
}

export function buildNextFreeSlot(classes: ClassItem[], reference = new Date()): string {
  if (!classes.length) return "No classes scheduled today";

  const nowMinutes = reference.getHours() * 60 + reference.getMinutes();
  const timed = classes.map((item) => ({
    start: toMinutes(item.time),
    end: toMinutes(item.endTime),
    labelStart: item.time,
    labelEnd: item.endTime
  }));

  for (let i = 0; i < timed.length - 1; i += 1) {
    const gapStart = timed[i]!.end;
    const gapEnd = timed[i + 1]!.start;
    if (gapEnd > gapStart && nowMinutes >= gapStart && nowMinutes < gapEnd) {
      const duration = gapEnd - gapStart;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${timed[i]!.labelEnd} - ${timed[i + 1]!.labelStart} · ${hours ? `${hours}h ` : ""}${minutes}m`.trim();
    }
  }

  if (timed[0] && nowMinutes < timed[0].start) {
    return `Free until ${timed[0].labelStart}`;
  }

  return "No more classes today";
}
