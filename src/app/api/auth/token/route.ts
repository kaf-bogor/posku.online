import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  COOKIES,
  decodeJwtPayload,
  isSecureCookie,
  refreshGoogleIdToken,
} from '~/lib/auth/oauth';

export const dynamic = 'force-dynamic';

/**
 * Mengembalikan Google id_token yang masih berlaku (refresh otomatis via
 * refresh_token bila mendekati kedaluwarsa). Dipakai klien utk Authorization.
 */
async function resolveIdToken() {
  const store = await cookies();
  const idToken = store.get(COOKIES.idToken)?.value || '';

  const expMs = (token: string): number => {
    const p = decodeJwtPayload(token);
    const exp = Number(p?.exp ?? 0);
    return exp ? exp * 1000 : 0;
  };

  if (idToken && expMs(idToken) > Date.now() + 60_000) {
    return { idToken, refreshed: false };
  }

  const refreshToken = store.get(COOKIES.refreshToken)?.value;
  if (!refreshToken) return { idToken: '', refreshed: false };

  const tokens = await refreshGoogleIdToken(refreshToken);
  if (!tokens?.id_token) return { idToken: '', refreshed: false };
  return { idToken: tokens.id_token, refreshed: true };
}

export async function GET(request: Request) {
  const { idToken, refreshed } = await resolveIdToken();
  if (!idToken) return NextResponse.json({ idToken: null }, { status: 401 });

  const res = NextResponse.json({ idToken });
  if (refreshed) {
    res.cookies.set(COOKIES.idToken, idToken, {
      httpOnly: false,
      secure: isSecureCookie(request),
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });
  }
  return res;
}
