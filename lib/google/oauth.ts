/**
 * Google OAuth token helpers for Calendar API (refresh → short-lived access token).
 * Full sync logic lives outside this app (e.g. n8n).
 */

export type TokenRefreshResult = {
  accessToken: string;
  expiresIn: number;
};

export async function refreshGoogleAccessToken(
  _refreshToken: string,
): Promise<TokenRefreshResult> {
  void _refreshToken;
  throw new Error(
    "refreshGoogleAccessToken is not implemented yet. Configure Google OAuth client credentials and token endpoint exchange.",
  );
}
