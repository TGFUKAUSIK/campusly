import { createHmac } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function campusEmail(registrationNumber: string) {
  return `${registrationNumber.toLowerCase()}@campusly.vit.local`;
}

function campusPassword(registrationNumber: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "campusly-dev";
  return createHmac("sha256", secret).update(registrationNumber).digest("hex").slice(0, 24);
}

export async function ensureSupabaseUser(registrationNumber: string, fullName?: string) {
  const admin = createAdminClient();
  if (!admin) {
    return { userId: null as string | null, email: null as string | null, password: null as string | null };
  }

  const email = campusEmail(registrationNumber);
  const password = campusPassword(registrationNumber);

  const existing = await admin.auth.admin.listUsers();
  const found = existing.data.users.find(
    (user) => user.email?.toLowerCase() === email || user.user_metadata?.registration_number === registrationNumber
  );

  if (!found) {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        registration_number: registrationNumber,
        full_name: fullName ?? registrationNumber
      }
    });

    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "Unable to provision Supabase user.");
    }

    await admin.from("profiles").upsert({
      id: created.data.user.id,
      registration_number: registrationNumber,
      full_name: fullName ?? registrationNumber,
      campus: "Vellore Campus",
      program: "VIT Chennai"
    });

    return { userId: created.data.user.id, email, password };
  }

  await admin.auth.admin.updateUserById(found.id, { password });
  await admin.from("profiles").upsert({
    id: found.id,
    registration_number: registrationNumber,
    full_name: fullName ?? found.user_metadata?.full_name ?? registrationNumber,
    campus: "Vellore Campus",
    program: "VIT Chennai"
  });

  return { userId: found.id, email, password };
}
