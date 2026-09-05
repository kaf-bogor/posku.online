// Auth bersama untuk API worker D1.
// - requireUser : token Firebase ID valid (untuk menulis data pengguna biasa)
// - requireAdmin : token valid + email terdaftar di fs_admin

import { json } from './json';

const TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

async function bearerUser(request) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return { status: 401 };

  const token = header.slice(7).trim();
  if (!token) return { status: 401 };

  let res;
  try {
    res = await fetch(`${TOKENINFO_URL}?id_token=${encodeURIComponent(token)}`);
  } catch {
    return { status: 401 };
  }
  if (!res.ok) return { status: 401 };

  const info = await res.json();
  const email = String(info.email || '').toLowerCase();
  if (!email) return { status: 401 };

  return {
    ok: true,
    user: {
      email,
      uid: String(info.sub || email),
      name: String(info.name || info.email || email),
    },
  };
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

  const { results } = await env.DB.prepare(
    'SELECT 1 AS ok FROM fs_admin WHERE LOWER(id) = LOWER(?)'
  )
    .bind(result.user.email)
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
