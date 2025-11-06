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

type OrdersResponse = unknown;

export async function GET() {
  const authCookies = await getAuthCookies();
  let accessToken = authCookies.accessToken;
  let refreshToken = authCookies.refreshToken;

  if (!accessToken) {
    const refreshed = await attemptTokenRefresh(refreshToken);
    if (!refreshed) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    accessToken = refreshed.accessToken;
    refreshToken = refreshed.refreshToken;
  }

  const ordersResponse = await fetchOrders(accessToken);

  if (ordersResponse.status === 401 && refreshToken) {
    const refreshed = await attemptTokenRefresh(refreshToken);
    if (!refreshed) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    accessToken = refreshed.accessToken;
    const retryResponse = await fetchOrders(accessToken);
    return handleOrdersResponse(retryResponse);
  }

  return handleOrdersResponse(ordersResponse);
}

async function attemptTokenRefresh(refreshToken: string | null) {
  if (!refreshToken) {
    await clearAuthCookies();
    return null;
  }

  let response: Response;
  try {
    response = await fetchBackend("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    clearAuthCookies();
    return null;
  }

  const payload = await parseJsonSafe<unknown | ErrorResponse>(response);

  if (!response.ok) {
    clearAuthCookies();
    return null;
  }

  const tokens = resolveAuthTokens(payload);
  if (!tokens) {
    clearAuthCookies();
    return null;
  }

  await setAuthCookies(tokens);
  return tokens;
}

async function fetchOrders(accessToken: string) {
  try {
    return await fetchBackend("/api/account/orders", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    return new Response(null, { status: 502 });
  }
}

async function handleOrdersResponse(response: Response) {
  if (response.status === 502) {
    return NextResponse.json(
      { message: "Unable to reach orders service." },
      { status: 502 },
    );
  }

  const payload = await parseJsonSafe<OrdersResponse | ErrorResponse>(response);

  if (!response.ok) {
    const message = (payload as ErrorResponse | null)?.message ?? "Failed to fetch orders.";
    return NextResponse.json({ message }, { status: response.status });
  }

  if (payload === null || typeof payload === "undefined") {
    return new NextResponse(null, { status: response.status });
  }

  return NextResponse.json(payload, { status: response.status });
}
