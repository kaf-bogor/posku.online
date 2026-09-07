// Auth bersama untuk API worker D1.
// Validasi Google ID token (RS256) secara lokal terhadap public key Google
// (https://www.googleapis.com/oauth2/v3/certs).
// - requireUser : token valid (untuk menulis data pengguna biasa)
// - requireAdmin : token valid + email terdaftar di fs_admin

import { json } from './json';

const GOOGLE_CLIENT_ID =
  '311474638765-7l6ag4lbkuuelbs0fbdjvf0oqscu8901.apps.googleusercontent.com';
const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ALLOWED_ISS = ['https://accounts.google.com', 'accounts.google.com'];

let cachedJwks = null;

function fromBase64Url(s) {
  let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function toBytes(s) {
  const enc = new TextEncoder();
  return enc.encode(s);
}

async function getJwks() {
  if (cachedJwks) return cachedJwks;
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error('Gagal memuat public key Google');
  const data = await res.json();
  const keys = {};
  for (const k of data.keys || []) keys[k.kid] = k;
  cachedJwks = keys;
  return keys;
}

async function verifyGoogleToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  let payload;
  let header;
  try {
    header = JSON.parse(fromBase64Url(headerB64));
    payload = JSON.parse(fromBase64Url(payloadB64));
  } catch {
    return null;
  }

  // Hanya token OAuth utk client ini
  if (payload.aud !== GOOGLE_CLIENT_ID) return null;
  if (!ALLOWED_ISS.includes(payload.iss)) return null;
  if (!payload.exp || payload.exp * 1000 <= Date.now()) return null;

  try {
    const jwks = await getJwks();
    const jwk = jwks[header.kid];
    if (!jwk) return null;

    const key = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = new Uint8Array(
      atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => c.charCodeAt(0))
    );
    const valid = await crypto.subtle.verify(
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      key,
      signature,
      toBytes(`${headerB64}.${payloadB64}`)
    );
    if (!valid) return null;
  } catch {
    return null;
  }

  const email = String(payload.email || '').toLowerCase();
  return {
    ok: true,
    user: {
      email,
      uid: String(payload.sub || email),
      name: String(payload.name || email || ''),
    },
  };
}

async function bearerUser(request) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return { status: 401 };

  const token = header.slice(7).trim();
  if (!token) return { status: 401 };

  try {
    const result = await verifyGoogleToken(token);
    if (!result) return { status: 401 };
    return result;
  } catch {
    return { status: 401 };
  }
}

export async function requireUser(request) {
  const result = await bearerUser(request);
  if (!result.ok) {
    return { error: json({ error: 'Unauthorized' }, result.status) };
  }
  return { user: result.user };
}

export async function requireAdmin(request, env) {
  const result = await bearerUser(request);
  if (!result.ok) {
    return { error: json({ error: 'Unauthorized' }, result.status) };
  }

  const email = result.user.email;
  if (!email) {
    return { error: json({ error: 'Forbidden' }, 403) };
  }

  const { results } = await env.DB.prepare(
    'SELECT 1 AS ok FROM fs_admin WHERE LOWER(id) = LOWER(?)'
  )
    .bind(email)
    .all();
  if (results.length === 0) {
    return { error: json({ error: 'Forbidden' }, 403) };
  }

  return { user: result.user };
}

export async function meStatus(request, env) {
  const result = await bearerUser(request);
  if (!result.ok) {
    return json({ error: 'Unauthorized', admin: false }, 401);
  }

  const { results } = await env.DB.prepare(
    'SELECT 1 AS ok FROM fs_admin WHERE LOWER(id) = LOWER(?)'
  )
    .bind(result.user.email)
    .all();

  return json({
    admin: results.length > 0,
    email: result.user.email,
    name: result.user.name,
    uid: result.user.uid,
  });
}

export async function listAdmins(env) {
  const { results } = await env.DB.prepare(
    'SELECT id FROM fs_admin ORDER BY id ASC'
  ).all();
  return json({ data: results.map((r) => r.id) });
}
