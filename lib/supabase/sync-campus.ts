import type { CampusData } from "@/lib/campus-data/types";
import { createAdminClient } from "@/lib/supabase/admin";

export async function syncCampusCache(userId: string, registrationNumber: string, payload: CampusData) {
  const admin = createAdminClient();
  if (!admin) return;

  await admin.from("campus_cache").upsert({
    user_id: userId,
    registration_number: registrationNumber,
    payload,
    updated_at: new Date().toISOString()
  });
}

export async function readCampusCache(userId: string): Promise<CampusData | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin.from("campus_cache").select("payload").eq("user_id", userId).maybeSingle();
  if (error || !data?.payload) return null;
  return data.payload as CampusData;
}
