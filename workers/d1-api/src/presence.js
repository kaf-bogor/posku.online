// API presence "sedang online" (Cloudflare Worker, D1).
//
// Endpoint:
//   GET  /api/presence/online?minutes=5  -> daftar pengguna online (publik)
//   POST /api/presence/heartbeat         -> kirim heartbeat user login
//   POST /api/presence/leave             -> tandai pergi (opsional)

import { requireUser } from './auth';
import { json } from './json';

function now() {
  return Date.now();
}

export async function handlePresence(request, env, url) {
  const path = url.pathname;

  try {
    if (path === '/api/presence/online' && request.method === 'GET') {
      const minutes = Math.max(
        1,
        Math.min(Number(url.searchParams.get('minutes')) || 5, 60)
      );
      const cutoff = now() - minutes * 60 * 1000;
      const { results } = await env.DB.prepare(
        'SELECT id, email, name, last_seen FROM fs_presence WHERE last_seen >= ? ORDER BY name ASC'
      )
        .bind(cutoff)
        .all();

      const data = results.map((r) => ({
        uid: r.id,
        email: r.email,
        name: r.name,
        lastSeen: Number(r.last_seen),
      }));
      return json({ data });
    }

    if (path === '/api/presence/heartbeat' && request.method === 'POST') {
      const guard = await requireUser(request);
      if (guard.error) return guard.error;
      const { user } = guard;
      await env.DB.prepare(
        `INSERT INTO fs_presence (id, email, name, last_seen)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET email = excluded.email,
           name = excluded.name, last_seen = excluded.last_seen`
      )
        .bind(user.uid, user.email, user.name, now())
        .run();
      return json({ ok: true });
    }

    if (path === '/api/presence/leave' && request.method === 'POST') {
      const guard = await requireUser(request);
      if (guard.error) return guard.error;
      await env.DB.prepare(
        'UPDATE fs_presence SET last_seen = ? WHERE id = ?'
      )
        .bind(now() - 10 * 60 * 1000, guard.user.uid)
        .run();
      return json({ ok: true });
    }

    return json({ error: 'Not found' }, 404);
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      500
    );
  }
}
