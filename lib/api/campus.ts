import { fetchWithOfflineCache } from "@/lib/api/client";
import type { CampusData } from "@/lib/campus-data/types";

export function getCampusData() {
  return fetchWithOfflineCache<CampusData>("/api/campus", {
    cacheKey: "campus:data",
    cache: "no-store"
  });
}
