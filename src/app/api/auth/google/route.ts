import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  COOKIES,
  GOOGLE_AUTH_URL,
  GOOGLE_CLIENT_ID,
  callbackUri,
} from '~/lib/auth/oauth';

export const dynamic = 'force-dynamic';

/**
 * Mulai login Google: simpan state (csrf + redirect tujuan) di cookie lalu
 * arahkan ke konsent Google. Callback: /api/auth/callback/google.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('next') || '/';
  const token = crypto.randomUUID();
  const statePayload = Buffer.from(
    JSON.stringify({ s: token, r: redirectTo })
  ).toString('base64url');

  const store = await cookies();
  store.set(COOKIES.state, statePayload, {
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: callbackUri(url.origin),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: token,
  });

  return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}
