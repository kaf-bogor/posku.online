import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  COOKIES,
  decodeJwtPayload,
  isSecureCookie,
  refreshGoogleIdToken,
} from '~/lib/auth/oauth';
import type { AuthUser } from '~/lib/types/auth';

export const dynamic = 'force-dynamic';

const D1_API_URL =
  process.env.NEXT_PUBLIC_D1_API_URL || 'https://posku-d1.kubido.workers.dev';

async function resolveIdToken() {
  const store = cookies();
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

/** Status user saat ini: { user: AuthUser | null }. */
export async function GET(request: Request) {
  const { idToken, refreshed } = await resolveIdToken();
  const res = NextResponse.json({ user: null });

  if (refreshed) {
    res.cookies.set(COOKIES.idToken, idToken, {
      httpOnly: false,
      secure: isSecureCookie(request),
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });
  }

  if (!idToken) return res;

  try {
    const api = await fetch(`${D1_API_URL}/api/me`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        Accept: 'application/json',
      },
    });
    if (!api.ok) return res;

    const data = (await api.json()) as {
      admin?: boolean;
      email?: string;
      name?: string;
      uid?: string;
    };
    const payload = decodeJwtPayload(idToken) || {};
    const email = String(data.email || payload.email || '').toLowerCase();
    const name = String(data.name || payload.name || payload.email || '');
    const user: AuthUser = {
      email,
      name,
      displayName: name,
      photoURL: String(payload.picture || '') || null,
      uid: String(data.uid || payload.sub || email),
      admin: Boolean(data.admin),
    };
    return NextResponse.json({ user });
  } catch {
    return res;
  }
}
