import { fetchWithOfflineCache } from "@/lib/api/client";
import type { AttendanceDashboardData } from "@/lib/campus-data/types";

export type AttendanceSummary = {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  attended: number;
  conducted: number;
  percentage: number;
};

export function getAttendanceDashboard(semesterId?: string) {
  const query = semesterId ? `?semester=${encodeURIComponent(semesterId)}` : "";
  return fetchWithOfflineCache<AttendanceDashboardData>(`/api/attendance${query}`, {
    cacheKey: `attendance:dashboard${query}`
  });
}

export function getAttendance(semesterId: string) {
  return getAttendanceDashboard(semesterId);
}

export function calculateMissableClasses(attended: number, conducted: number, threshold = 75) {
  let missable = 0;

  while ((attended / (conducted + missable + 1)) * 100 >= threshold) {
    missable += 1;
  }

  return missable;
}

export function calculateRequiredClasses(attended: number, conducted: number, threshold = 75) {
  let required = 0;

  while (((attended + required) / (conducted + required)) * 100 < threshold) {
    required += 1;
  }

  return required;
}
