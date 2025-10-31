import { ExpirationInput, SetAuthCookiesParams } from "@/lib/cookies";

type TokenResponsePayload = {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  expiresAt?: unknown;
  expiresAtUtc?: unknown;
  accessTokenExpiresAt?: unknown;
  refreshTokenExpiresAt?: unknown;
  refreshExpiresAt?: unknown;
  refreshExpiresAtUtc?: unknown;
};

type ExpirationResult = {
  accessExp?: ExpirationInput;
  refreshExp?: ExpirationInput;
};

export function resolveAuthTokens(payload: unknown): SetAuthCookiesParams | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const tokenPayload = payload as TokenResponsePayload;
  const accessToken = tokenPayload.accessToken ?? tokenPayload.token;
  const refreshToken = tokenPayload.refreshToken;

  if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
    return null;
  }

  const { accessExp, refreshExp } = resolveExpirations(tokenPayload);

  return {
    accessToken,
    refreshToken,
    accessExp,
    refreshExp,
  };
}

function resolveExpirations(payload: TokenResponsePayload): ExpirationResult {
  let accessExp: ExpirationInput =
    payload.accessTokenExpiresAt ?? payload.expiresAt ?? payload.expiresAtUtc;
  let refreshExp: ExpirationInput =
    payload.refreshTokenExpiresAt ?? payload.refreshExpiresAt ?? payload.refreshExpiresAtUtc;

  const expiresAt = payload.expiresAt;
  if (expiresAt && typeof expiresAt === "object" && !Array.isArray(expiresAt)) {
    const expiresRecord = expiresAt as Record<string, unknown>;
    accessExp = accessExp ?? (expiresRecord.accessToken as ExpirationInput);
    accessExp = accessExp ?? (expiresRecord.access as ExpirationInput);
    refreshExp = refreshExp ?? (expiresRecord.refreshToken as ExpirationInput);
    refreshExp = refreshExp ?? (expiresRecord.refresh as ExpirationInput);
  }

  return { accessExp, refreshExp };
}
