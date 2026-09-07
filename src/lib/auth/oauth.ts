// Utilitas OAuth Google (authorization code) untuk login admin POSKU.
// Hanya dipakai di sisi server (Next API route), bukan di client bundle.

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  '311474638765-7l6ag4lbkuuelbs0fbdjvf0oqscu8901.apps.googleusercontent.com';

export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

export const CALLBACK_PATH = '/api/auth/callback/google';

export function callbackUri(origin: string): string {
  return `${origin}${CALLBACK_PATH}`;
}

// ---------- base64url -> JSON ----------
function fromBase64Url(s: string): string {
  let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  return Buffer.from(b64, 'base64').toString('utf8');
}

export function toBase64Url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

/** Decode payload JWT (tanpa verifikasi; verifikasi dilakukan worker). */
export function decodeJwtPayload(
  token: string
): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(fromBase64Url(parts[1])) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export interface GoogleTokens {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

async function postToken(
  form: Record<string, string>
): Promise<GoogleTokens | null> {
  const params = new URLSearchParams(form);
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  if (!res.ok) return null;
  return (await res.json()) as GoogleTokens;
}

/** Tukar authorization code -> token (termasuk id_token & refresh_token). */
export async function exchangeGoogleCode(
  code: string,
  origin: string
): Promise<GoogleTokens | null> {
  return postToken({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: callbackUri(origin),
    grant_type: 'authorization_code',
  });
}

/** Ambil id_token baru memakai refresh_token (sesi admin bertahan lama). */
export async function refreshGoogleIdToken(
  refreshToken: string
): Promise<GoogleTokens | null> {
  return postToken({
    refresh_token: refreshToken,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    grant_type: 'refresh_token',
  });
}

export const COOKIES = {
  idToken: 'posku_id_token',
  refreshToken: 'posku_refresh',
  state: 'posku_oauth_state',
} as const;

export function isSecureCookie(req: Request): boolean {
  return req.url.startsWith('https://');
}
