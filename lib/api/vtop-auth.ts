export type VtopCredentials = {
  username: string;
  password: string;
  captcha: string;
};

export async function signInToVtop(credentials: VtopCredentials) {
  const response = await fetch("/api/vtop/login", {
    body: JSON.stringify(credentials),
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
  const body = (await response.json()) as { ok?: true; authorizedID?: string; error?: string };

  if (!response.ok || !body.ok) {
    throw new Error(body.error ?? "Unable to start the VTOP session.");
  }

  return body as { ok: true; authorizedID?: string };
}

export async function signOutFromVtop() {
  const response = await fetch("/api/vtop/logout", {
    cache: "no-store",
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to end the VTOP session.");
  }
}

export async function getVtopAuthStatus() {
  const response = await fetch("/api/vtop/session", { cache: "no-store" });
  if (!response.ok) {
    return { authenticated: false as const };
  }
  return (await response.json()) as
    | { authenticated: true; kind: "vtop"; authorizedID: string }
    | { authenticated: true; kind: "bridge" }
    | { authenticated: false };
}
