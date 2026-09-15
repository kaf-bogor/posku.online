import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  GATE_COOKIE,
  GATE_TTL_SECONDS,
  signGate,
  verifyTurnstileToken,
} from '~/lib/turnstile';

export const dynamic = 'force-dynamic';

/** Verifikasi token Turnstile lalu set cookie gerbang bila lolos. */
export async function POST(request: Request) {
  let token: unknown = '';
  try {
    const body = (await request.json()) as { token?: unknown };
    token = body?.token;
  } catch {
    token = '';
  }

  const ip =
    request.headers.get('cf-connecting-ip') ||
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    undefined;

  let ok = false;
  try {
    ok = await verifyTurnstileToken(token, ip);
  } catch {
    ok = false;
  }

  if (!ok) {
    return NextResponse.json(
      { ok: false, error: 'Verifikasi gagal' },
      { status: 403 }
    );
  }

  const value = await signGate();
  const res = NextResponse.json({ ok: true });
  const store = await cookies();
  store.set(GATE_COOKIE, value, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: GATE_TTL_SECONDS,
  });
  return res;
}
