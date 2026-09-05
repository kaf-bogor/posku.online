// API kelas/wakaf per kelas (Cloudflare Worker, D1).
// Data sumber: fs_wakaf_kelas / fs_wakaf_kelas_participant / fs_wakaf_kelas_activity.
//
// Endpoint:
//   GET    /api/wakaf-kelas               -> daftar kelas (dgn peserta & aktivitas)
//   GET    /api/wakaf-kelas/:name         -> detail; otomatis buat bila belum ada
//   PUT    /api/wakaf-kelas/:name         -> ubah target / santri_count  [admin]
//   POST   /api/wakaf-kelas/:name/participants   -> tambah peserta        [admin]
//   DELETE /api/wakaf-kelas/:name/participants   -> hapus peserta (body)  [admin]

import { requireAdmin } from './auth';
import { json } from './json';

const rupiah = (n) =>
  (Number(n) || 0).toLocaleString('id-ID');

async function rowToKelas(env, row) {
  const pRes = await env.DB.prepare(
    `SELECT name, value, datetime FROM fs_wakaf_kelas_participant
     WHERE program_id = ? ORDER BY id ASC`
  )
    .bind(row.id)
    .all();

  const aRes = await env.DB.prepare(
    `SELECT user_id, user_name, type, description, datetime
     FROM fs_wakaf_kelas_activity WHERE program_id = ? ORDER BY id ASC`
  )
    .bind(row.id)
    .all();

  const participants = pRes.results.map((p) => ({
    name: p.name,
    value: Number(p.value) || 0,
    datetime: p.datetime,
  }));

  const collected = participants.reduce((sum, p) => sum + p.value, 0);

  return {
    name: row.id,
    santriCount: Number(row.santri_count) || 0,
    target: Number(row.target) || 0,
    collected,
    participants,
    activities: aRes.results.map((a) => ({
      userId: a.user_id,
      userName: a.user_name,
      type: a.type,
      description: a.description,
      datetime: a.datetime,
    })),
  };
}

async function ensureRow(env, name) {
  const { results } = await env.DB.prepare('SELECT * FROM fs_wakaf_kelas WHERE id = ?')
    .bind(name)
    .all();
  if (results.length) return results[0];

  await env.DB.prepare(
    'INSERT INTO fs_wakaf_kelas (id, name, target, collected, santri_count) VALUES (?,?,?,?,?)'
  )
    .bind(name, name, 0, 0, 0)
    .run();
  const again = await env.DB.prepare('SELECT * FROM fs_wakaf_kelas WHERE id = ?')
    .bind(name)
    .all();
  return again.results[0];
}

async function recomputeCollected(env, name) {
  const pRes = await env.DB.prepare(
    'SELECT COALESCE(SUM(value),0) AS total FROM fs_wakaf_kelas_participant WHERE program_id = ?'
  )
    .bind(name)
    .all();
  const total = Number(pRes.results[0].total) || 0;
  await env.DB.prepare('UPDATE fs_wakaf_kelas SET collected = ? WHERE id = ?')
    .bind(total, name)
    .run();
  return total;
}

function logActivity(env, name, user, type, description) {
  return env.DB.prepare(
    `INSERT INTO fs_wakaf_kelas_activity (program_id, user_id, user_name, type, description, datetime)
     VALUES (?,?,?,?,?,?)`
  ).bind(name, user.uid, user.name, type, description, new Date().toISOString());
}

// ---------- handlers ----------
async function listAll(env) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM fs_wakaf_kelas ORDER BY id ASC'
  ).all();
  const data = [];
  for (const row of results) data.push(await rowToKelas(env, row));
  return json({ data });
}

async function getOne(env, name) {
  const row = await ensureRow(env, name);
  return json(await rowToKelas(env, row));
}

async function update(env, name, body) {
  const row = await ensureRow(env, name);
  const before = await rowToKelas(env, row);
  const nextTarget = body.target !== undefined ? Number(body.target) : before.target;
  const nextSantri =
    body.santriCount !== undefined ? Number(body.santriCount) : before.santriCount;

  await env.DB.prepare(
    'UPDATE fs_wakaf_kelas SET target = ?, santri_count = ? WHERE id = ?'
  )
    .bind(nextTarget, nextSantri, name)
    .run();

  if (body.target !== undefined && Number(body.target) !== before.target) {
    const desc = `Mengubah target dari Rp ${rupiah(before.target)} ke Rp ${rupiah(nextTarget)}`;
    await logActivity(env, name, body.user, 'update_target', desc).run();
  }

  return json(await rowToKelas(env, await ensureRow(env, name)));
}

async function addParticipant(env, name, body, user) {
  await ensureRow(env, name);
  const value = Number(body.value) || 0;
  const participant = {
    name: String(body.name ?? '').trim(),
    value,
    datetime: body.datetime ? new Date(body.datetime).toISOString() : null,
  };
  if (!participant.name) return json({ error: 'name wajib diisi' }, 400);

  await env.DB.prepare(
    `INSERT INTO fs_wakaf_kelas_participant (program_id, name, value, datetime)
     VALUES (?,?,?,?)`
  )
    .bind(name, participant.name, value, participant.datetime)
    .run();

  await recomputeCollected(env, name);
  const desc = `Menambah peserta ${participant.name} dengan nominal Rp ${rupiah(value)}`;
  await logActivity(env, name, user, 'add', desc).run();

  return json(await rowToKelas(env, await ensureRow(env, name)), 201);
}

async function removeParticipant(env, name, body, user) {
  const row = await ensureRow(env, name);
  const p = body || {};
  const value = Number(p.value) || 0;

  const found = await env.DB.prepare(
    `SELECT id FROM fs_wakaf_kelas_participant
     WHERE program_id = ? AND name = ? AND value = ? AND datetime = ? LIMIT 1`
  )
    .bind(name, p.name ?? null, value, p.datetime ?? null)
    .all();
  if (found.results.length === 0) return json({ error: 'Peserta tidak ditemukan' }, 404);

  await env.DB.prepare('DELETE FROM fs_wakaf_kelas_participant WHERE id = ?')
    .bind(found.results[0].id)
    .run();

  await recomputeCollected(env, name);
  const desc = `Menghapus peserta ${p.name} dengan nominal Rp ${rupiah(value)}`;
  await logActivity(env, name, user, 'remove', desc).run();

  return json(await rowToKelas(env, row), 201);
}

// ---------- router ----------
export async function handleKelas(request, env, url) {
  const path = url.pathname;
  try {
    const list = path === '/api/wakaf-kelas' || path === '/api/wakaf-kelas/';
    const match = path.match(/^\/api\/wakaf-kelas\/([^/]+)$/);
    const partMatch = path.match(/^\/api\/wakaf-kelas\/([^/]+)\/participants$/);

    if (list && request.method === 'GET') return await listAll(env);

    if (partMatch) {
      const name = decodeURIComponent(partMatch[1]);
      if (request.method === 'POST') {
        const guard = await requireAdmin(request, env);
        if (guard.error) return guard.error;
        return await addParticipant(env, name, await request.json(), guard.user);
      }
      if (request.method === 'DELETE') {
        const guard = await requireAdmin(request, env);
        if (guard.error) return guard.error;
        return await removeParticipant(env, name, await request.json(), guard.user);
      }
      return json({ error: 'Method not allowed' }, 405);
    }

    if (match) {
      const name = decodeURIComponent(match[1]);
      if (request.method === 'GET') return await getOne(env, name);
      if (request.method === 'PUT' || request.method === 'PATCH') {
        const guard = await requireAdmin(request, env);
        if (guard.error) return guard.error;
        const body = await request.json();
        return await update(env, name, { ...body, user: guard.user });
      }
      return json({ error: 'Method not allowed' }, 405);
    }

    return json({ error: 'Not found' }, 404);
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      500
    );
  }
}
