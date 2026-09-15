// Utilitas Turnstile sisi server (siteverify + cookie gerbang).
// Hanya dipakai di server (route handler / layout), bukan di bundle klien.

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const GATE_COOKIE = 'posku_ts';
export const GATE_TTL_SECONDS = 60 * 60 * 12; // 12 jam

function expectedAction(): string {
  return process.env.TURNSTILE_ACTION || 'site-access';
}

function allowedHostnames(): string[] {
  return (process.env.TURNSTILE_HOSTNAMES || 'poskubogor.com')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
}

export interface SiteverifyResult {
  success: boolean;
  hostname?: string;
  action?: string;
  'error-codes'?: string[];
}

export async function siteverify(
  token: string,
  remoteip?: string
): Promise<SiteverifyResult> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) throw new Error('TURNSTILE_SECRET belum diset');

  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set('remoteip', remoteip);

  const res = await fetch(SITEVERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`siteverify ${res.status}`);
  return (await res.json()) as SiteverifyResult;
}

/** Validasi token Turnstile lengkap: success + action + hostname. */
export async function verifyTurnstileToken(
  token: unknown,
  remoteip?: string
): Promise<boolean> {
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    return false;
  }
  const hosts = allowedHostnames();
  if (hosts.length === 0) return false;

  const result = await siteverify(token, remoteip);
  return Boolean(
    result.success &&
      (!result.action || result.action === expectedAction()) &&
      (!result.hostname || hosts.includes(result.hostname))
  );
}

// ---------- cookie gerbang bertanda tangan (HMAC) ----------
function b64url(bytes: Uint8Array): string {
  const bin = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(value: string): Promise<string> {
  const secret = process.env.TURNSTILE_COOKIE_SECRET;
  if (!secret) throw new Error('TURNSTILE_COOKIE_SECRET belum diset');
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value)
  );
  return b64url(new Uint8Array(sig));
}

/** Buat nilai cookie `exp.sig` untuk sesi gerbang. */
export async function signGate(): Promise<string> {
  const exp = Date.now() + GATE_TTL_SECONDS * 1000;
  const sig = await hmac(String(exp));
  return `${exp}.${sig}`;
}

/** Verifikasi nilai cookie gerbang (kedaluwarsa + tanda tangan). */
export async function verifyGate(value?: string | null): Promise<boolean> {
  if (!value) return false;
  const [expStr, sig] = value.split('.');
  const exp = Number(expStr);
  if (!exp || Number.isNaN(exp) || exp <= Date.now()) return false;
  if (!sig) return false;
  try {
    const expected = await hmac(expStr);
    return sig === expected;
  } catch {
    return false;
  }
}
