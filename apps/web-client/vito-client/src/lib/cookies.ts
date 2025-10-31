import { cookies } from "next/headers";

export type ExpirationInput = Date | string | number | undefined;

export type SetAuthCookiesParams = {
  accessToken: string;
  refreshToken: string;
  accessExp?: ExpirationInput;
  refreshExp?: ExpirationInput;
};

export type AuthCookies = {
  accessToken: string | null;
  refreshToken: string | null;
};

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function resolveExpiration(expiration: ExpirationInput, fallbackMs: number) {
  if (expiration instanceof Date) {
    return expiration;
  }

  if (typeof expiration === "number") {
    return new Date(expiration);
  }

  if (typeof expiration === "string") {
    const date = new Date(expiration);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date(Date.now() + fallbackMs);
}

export function getAuthCookies(): AuthCookies {
  const store = cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value ?? null;

  return { accessToken, refreshToken };
}

export function setAuthCookies({
  accessToken,
  refreshToken,
  accessExp,
  refreshExp,
}: SetAuthCookiesParams) {
  const store = cookies();

  store.set({
    name: ACCESS_TOKEN_COOKIE,
    value: accessToken,
    expires: resolveExpiration(accessExp, FIFTEEN_MINUTES_MS),
    ...baseCookieOptions,
  });

  store.set({
    name: REFRESH_TOKEN_COOKIE,
    value: refreshToken,
    expires: resolveExpiration(refreshExp, THIRTY_DAYS_MS),
    ...baseCookieOptions,
  });
}

export function clearAuthCookies() {
  const store = cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}
