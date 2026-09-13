import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { COOKIES } from '~/lib/auth/oauth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const store = await cookies();
  store.delete(COOKIES.idToken);
  store.delete(COOKIES.refreshToken);
  store.delete(COOKIES.state);
  return NextResponse.json({ ok: true });
}
