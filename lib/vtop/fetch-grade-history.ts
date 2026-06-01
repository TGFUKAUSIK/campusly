import campusConfig from "@/lib/vtop/campus-config.json";
import { fetchVtopSemesterGrades } from "@/lib/vtop/fetch-grades";
import type { VtopSession } from "@/lib/vtop/types";

const semesterIDs = campusConfig.semesterIDs as string[];

export async function fetchVtopGradeHistory(session: VtopSession) {
  const startYear = parseInt(session.authorizedID.slice(0, 2), 10) + 2000;
  const currentYear = new Date().getFullYear();
  const candidates = new Set<string>();

  for (let year = startYear; year <= currentYear + 1; year++) {
    const next = (year + 1).toString().slice(-2);
    candidates.add(`CH${year}${next}01`);
    candidates.add(`CH${year}${next}05`);
    candidates.add(`CH${year}${next}07`);
  }

  for (const id of semesterIDs) {
    candidates.add(id);
  }

  const results: Array<{ semesterId: string; gpa: number | null }> = [];

  for (const semesterId of candidates) {
    try {
      const { gpa } = await fetchVtopSemesterGrades(session, semesterId);
      if (gpa !== null) results.push({ semesterId, gpa });
    } catch {
      // Semester not available for this student.
    }
  }

  return results.sort((a, b) => a.semesterId.localeCompare(b.semesterId));
}
