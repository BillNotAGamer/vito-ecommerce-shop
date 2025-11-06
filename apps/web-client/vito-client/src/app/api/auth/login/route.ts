import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, parseJsonSafe } from "@/lib/backend";
import { clearAuthCookies, setAuthCookies } from "@/lib/cookies";
import { resolveAuthTokens } from "@/lib/auth";

type ErrorResponse = {
  message?: string;
};

function createErrorResponse(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  let backendResponse: Response;
  try {
    backendResponse = await fetchBackend("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (error) {
    return createErrorResponse(502, "Unable to reach authentication service.");
  }

  const responseData = await parseJsonSafe<unknown | ErrorResponse>(backendResponse);

  if (!backendResponse.ok) {
    const message = (responseData as ErrorResponse | null)?.message ?? "Login failed.";
    return createErrorResponse(backendResponse.status, message);
  }

  const tokens = resolveAuthTokens(responseData);

  if (!tokens) {
    await clearAuthCookies();
    return createErrorResponse(502, "Authentication tokens missing from response.");
  }

  await setAuthCookies(tokens);

  return new NextResponse(null, { status: 204 });
}
