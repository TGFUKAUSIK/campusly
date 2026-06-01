"use client";

import { useQuery } from "@tanstack/react-query";
import { getCampusData } from "@/lib/api/campus";
import { emptyCampusData } from "@/lib/campus-data/empty";

export function useCampusData() {
  return useQuery({
    queryKey: ["campus"],
    queryFn: getCampusData,
    retry: 1,
    staleTime: 0
  });
}

export function useCampusDataOrEmpty() {
  const query = useCampusData();
  return {
    ...query,
    data: query.data ?? emptyCampusData
  };
}
