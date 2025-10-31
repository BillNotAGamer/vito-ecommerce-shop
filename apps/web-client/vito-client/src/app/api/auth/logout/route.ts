import { NextResponse } from "next/server";

import { fetchBackend, parseJsonSafe } from "@/lib/backend";
import { clearAuthCookies, getAuthCookies } from "@/lib/cookies";

type ErrorResponse = {
  message?: string;
};

export async function POST() {
  const { refreshToken } = getAuthCookies();

  let backendResponse: Response | null = null;
  if (refreshToken) {
    try {
      backendResponse = await fetchBackend("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      clearAuthCookies();
      return NextResponse.json(
        { message: "Unable to reach authentication service." },
        { status: 502 },
      );
    }
  }

  clearAuthCookies();

  if (!backendResponse) {
    return new NextResponse(null, { status: 204 });
  }

  if (!backendResponse.ok) {
    const payload = await parseJsonSafe<ErrorResponse>(backendResponse);
    const message = payload?.message ?? "Failed to logout.";
    return NextResponse.json({ message }, { status: backendResponse.status });
  }

  return new NextResponse(null, { status: 204 });
}
