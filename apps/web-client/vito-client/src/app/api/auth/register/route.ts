import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, parseJsonSafe } from "@/lib/backend";

type ErrorResponse = {
  message?: string;
};

type SuccessResponse = Record<string, unknown> | null;

export async function POST(request: NextRequest) {
  const body = await request.json();

  let backendResponse: Response;
  try {
    backendResponse = await fetchBackend("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to reach authentication service." },
      { status: 502 },
    );
  }

  const payload = await parseJsonSafe<SuccessResponse | ErrorResponse>(backendResponse);

  if (!backendResponse.ok) {
    const message = (payload as ErrorResponse | null)?.message ?? "Registration failed.";
    return NextResponse.json({ message }, { status: backendResponse.status });
  }

  if (payload && typeof payload === "object") {
    return NextResponse.json(payload, { status: backendResponse.status });
  }

  return new NextResponse(null, { status: backendResponse.status });
}
