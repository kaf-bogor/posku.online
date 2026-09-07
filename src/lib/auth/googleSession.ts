// Sesi Google OAuth sisi klien.
// id_token disimpan di cookie `posku_id_token` (bisa dibaca JS) supaya bisa
// dipakai sebagai Authorization: Bearer ke worker D1. Refresh otomatis lewat
// /api/auth/token memakai refresh_token yang tersimpan httpOnly.

import type { AuthUser } from '~/lib/types/auth';

const ID_COOKIE = 'posku_id_token';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&')}=([^;]*)`
    )
  );
  return m ? decodeURIComponent(m[1]) : null;
}

function payloadExp(token: string): number {
  try {
    const part = token.split('.')[1];
    if (!part) return 0;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    const body = atob(b64 + '='.repeat(pad ? 4 - pad : 0));
    const obj = JSON.parse(body) as { exp?: number };
    return obj.exp ? obj.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

/** id_token Google yang masih berlaku; refresh bila mendekati kedaluwarsa. */
export async function getGoogleToken(): Promise<string | null> {
  const token = readCookie(ID_COOKIE);
  if (!token) return null;
  if (payloadExp(token) > Date.now() + 60_000) return token;

  try {
    const res = await fetch('/api/auth/token', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { idToken?: string | null };
    return typeof data.idToken === 'string' && data.idToken
      ? data.idToken
      : null;
  } catch {
    return null;
  }
}

/** Profil user saat ini (dari /api/auth/me). */
export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: AuthUser | null };
    return data.user ?? null;
  } catch {
    return null;
  }
}

/** Logout: hapus cookie sesi di server. */
export async function logoutSession(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // abaikan
  }
}
