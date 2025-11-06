import { NextResponse } from "next/server";

import { fetchBackend, parseJsonSafe } from "@/lib/backend";
import {
  clearAuthCookies,
  getAuthCookies,
  setAuthCookies,
} from "@/lib/cookies";
import { resolveAuthTokens } from "@/lib/auth";

type ErrorResponse = {
  message?: string;
};

export async function POST() {
  const { refreshToken } = await getAuthCookies();

  if (!refreshToken) {
    await clearAuthCookies();
    return NextResponse.json({ message: "Missing refresh token." }, { status: 401 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetchBackend("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    await clearAuthCookies();
    return NextResponse.json(
      { message: "Unable to reach authentication service." },
      { status: 502 },
    );
  }

  const payload = await parseJsonSafe<unknown | ErrorResponse>(backendResponse);

  if (!backendResponse.ok) {
    clearAuthCookies();
    const message = (payload as ErrorResponse | null)?.message ?? "Refresh token invalid.";
    return NextResponse.json({ message }, { status: 401 });
  }

  const tokens = resolveAuthTokens(payload);

  if (!tokens) {
    clearAuthCookies();
    return NextResponse.json(
      { message: "Authentication tokens missing from response." },
      { status: 502 },
    );
  }

  await setAuthCookies(tokens);

  return new NextResponse(null, { status: 204 });
}
