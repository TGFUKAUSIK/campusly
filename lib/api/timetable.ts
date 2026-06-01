import { fetchWithOfflineCache } from "@/lib/api/client";

export type TimetableEntry = {
  id: string;
  startsAt: string;
  endsAt: string;
  subjectCode: string;
  subjectName: string;
  room: string;
  faculty: string;
  classType: "lecture" | "lab" | "tutorial";
};

export function getTimetable(semesterId: string) {
  return fetchWithOfflineCache<TimetableEntry[]>(`/api/timetable?semester=${semesterId}`, {
    cacheKey: `timetable:${semesterId}`
  });
}
