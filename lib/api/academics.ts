import { fetchWithOfflineCache } from "@/lib/api/client";

export type Grade = {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  grade: string;
  score: number;
};

export function getGrades(semesterId: string) {
  return fetchWithOfflineCache<Grade[]>(`/api/academics/grades?semester=${semesterId}`, {
    cacheKey: `grades:${semesterId}`
  });
}
