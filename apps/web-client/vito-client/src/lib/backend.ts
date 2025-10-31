const apiBase = process.env.NEXT_PUBLIC_API_BASE;

if (!apiBase) {
  throw new Error("NEXT_PUBLIC_API_BASE environment variable is not defined.");
}

export const API_BASE = apiBase;

export function fetchBackend(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers ?? {});

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
}

export async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    return null;
  }
}
