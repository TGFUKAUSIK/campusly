"use client";

import { useQuery } from "@tanstack/react-query";
import { useCampusDataOrEmpty } from "@/lib/hooks/use-campus-data";

export function useAttendance() {
  return useCampusDataOrEmpty();
}
