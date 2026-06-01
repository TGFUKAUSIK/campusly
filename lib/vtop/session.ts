import { cookies } from "next/headers";
import type { VtopSession } from "@/lib/vtop/types";

export const SESSION_COOKIE = "campusly_vtop_session";
export const PRELOGIN_COOKIE = "campusly_vtop_prelogin";
export const BRIDGE_CHALLENGE_COOKIE = "campusly_vtop_bridge_challenge";

type StoredSession =
  | { kind: "vtop"; session: VtopSession }
  | { kind: "bridge"; token: string };

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decode<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function serializeVtopSession(session: VtopSession): string {
  return encode({ kind: "vtop", session } satisfies StoredSession);
}

export function serializeBridgeSession(token: string): string {
  return encode({ kind: "bridge", token } satisfies StoredSession);
}

export function parseStoredSession(raw: string | undefined): StoredSession | null {
  const parsed = decode<StoredSession>(raw);
  if (parsed?.kind === "vtop" && parsed.session?.cookies && parsed.session.csrf && parsed.session.authorizedID) {
    return parsed;
  }
  if (parsed?.kind === "bridge" && parsed.token) {
    return parsed;
  }
  return null;
}

export async function getVtopSession(): Promise<VtopSession | null> {
  const store = await cookies();
  const stored = parseStoredSession(store.get(SESSION_COOKIE)?.value);
  return stored?.kind === "vtop" ? stored.session : null;
}

export async function getBridgeSessionToken(): Promise<string | null> {
  const store = await cookies();
  const stored = parseStoredSession(store.get(SESSION_COOKIE)?.value);
  return stored?.kind === "bridge" ? stored.token : null;
}

export async function hasActiveSession(): Promise<boolean> {
  const store = await cookies();
  return Boolean(parseStoredSession(store.get(SESSION_COOKIE)?.value));
}

export function cookieOptions(secure: boolean, maxAge = 60 * 60 * 6) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure
  };
}

export function encodePrelogin(prelogin: { cookies: string[]; csrf: string }): string {
  return encode(prelogin);
}

export async function getVtopPrelogin(): Promise<{ cookies: string[]; csrf: string } | null> {
  const store = await cookies();
  return decode(store.get(PRELOGIN_COOKIE)?.value);
}
