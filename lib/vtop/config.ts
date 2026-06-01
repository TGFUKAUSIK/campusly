import campusConfig from "@/lib/vtop/campus-config.json";

const semesterIDs = campusConfig.semesterIDs as string[];

export function defaultSemesterId(): string {
  return semesterIDs[semesterIDs.length - 2] ?? semesterIDs[semesterIDs.length - 1] ?? "CH20252601";
}

export function semesterLabel(semesterId: string): string {
  const suffix = semesterId.slice(-2);
  const year = semesterId.slice(2, 6);
  if (suffix === "01") return `Fall ${year}`;
  if (suffix === "05") return `Winter ${year}`;
  if (suffix === "07") return `Summer ${year}`;
  return semesterId;
}
