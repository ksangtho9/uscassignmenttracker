import "server-only";

/**
 * Google OAuth token helpers for Calendar API (refresh → short-lived access token).
 * Full sync logic lives outside this app (e.g. n8n).
 */

export type TokenRefreshResult = {
  accessToken: string;
  expiresIn: number;
};

export async function refreshGoogleAccessToken(
  refreshToken: string,
): Promise<TokenRefreshResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set to use the Google Calendar API.",
    );
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    // Do not log the refresh token.
    throw new Error(
      `Google token refresh failed with status ${response.status}.`,
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  return { accessToken: data.access_token, expiresIn: data.expires_in };
}
