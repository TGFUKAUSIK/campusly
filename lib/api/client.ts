type CacheRecord<T> = {
  value: T;
  savedAt: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function readCache<T>(key: string): CacheRecord<T> | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = window.localStorage.getItem(`campusly:${key}`);
    return cached ? (JSON.parse(cached) as CacheRecord<T>) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(`campusly:${key}`, JSON.stringify({ value, savedAt: Date.now() }));
  } catch {
    // Storage can be unavailable in private browsing. Network responses still work.
  }
}

export async function fetchWithOfflineCache<T>(
  input: string,
  init?: RequestInit & { cacheKey?: string; retries?: number }
): Promise<T> {
  const { cacheKey = input, retries = 2, ...requestInit } = init ?? {};

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(input, {
        ...requestInit,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...requestInit.headers
        }
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new ApiError(body.error ?? `Request failed with ${response.status}`, response.status);
      }

      const value = (await response.json()) as T;
      writeCache(cacheKey, value);
      return value;
    } catch (error) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
        continue;
      }

      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        throw error;
      }

      const cached = readCache<T>(cacheKey);
      if (cached) return cached.value;
      throw new ApiError("Request failed and no offline copy is available.", 0, error);
    }
  }

  throw new ApiError("Unexpected request state.", 0);
}
