import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { COOKIES, exchangeGoogleCode, isSecureCookie } from '~/lib/auth/oauth';

export const dynamic = 'force-dynamic';

/** Callback OAuth Google: tukar authorization code lalu set cookie sesi. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const errorParam = url.searchParams.get('error');
  const stateParam = url.searchParams.get('state');
  const store = await cookies();
  const stateCookie = store.get(COOKIES.state)?.value;
  store.delete(COOKIES.state);

  const go = (path: string) =>
    NextResponse.redirect(new URL(path || '/', url.origin).toString());

  const AUTH_ERROR = '/?auth=error';

  // Validasi state (csrf). Bila tidak cocok / rusak, tolak.
  let redirectPath = '/';
  if (stateCookie) {
    try {
      const parsed = JSON.parse(
        Buffer.from(stateCookie, 'base64url').toString('utf8')
      ) as { s?: string; r?: string };
      if (!stateParam || parsed.s !== stateParam) return go(AUTH_ERROR);
      redirectPath = parsed.r || '/';
    } catch {
      return go(AUTH_ERROR);
    }
  }

  if (errorParam || !code) return go(AUTH_ERROR);

  const tokens = await exchangeGoogleCode(code, url.origin);
  if (!tokens?.id_token) return go(AUTH_ERROR);

  const res = go(redirectPath);
  const secure = isSecureCookie(request);
  res.cookies.set(COOKIES.idToken, tokens.id_token, {
    httpOnly: false, // dibaca JS utk Authorization ke worker
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 jam; diperbarui via refresh token saat habis
  });
  if (tokens.refresh_token) {
    res.cookies.set(COOKIES.refreshToken, tokens.refresh_token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });
  }
  return res;
}
