// API kehadiran/attendance (Cloudflare Worker, D1). Data: fs_attendanceEvents & fs_attendanceRecords (JSON docs).
//
// Endpoint:
//   GET    /api/attendance/events                 -> daftar event (date desc)
//   POST   /api/attendance/events                 -> buat event                [admin]
//   GET    /api/attendance/events/:id             -> 1 event
//   PUT    /api/attendance/events/:id             -> perbarui event            [admin]
//   DELETE /api/attendance/events/:id             -> hapus event (+ records)   [admin]
//   GET    /api/attendance/events/:id/records     -> daftar check-in
//   POST   /api/attendance/events/:id/checkin     -> check-in (email body)     [user login]

import { requireAdmin, requireUser } from './auth';
import { json } from './json';

function genId() {
  const abc =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += abc[b % abc.length];
  return s;
}

function parseJson(s) {
  try {
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

const iso = (v, fallback = null) =>
  v ? new Date(v).toISOString() : fallback ?? new Date(0).toISOString();

function eventToDto(row) {
  const d = parseJson(row.data);
  return {
    id: row.id,
    title: d.title ?? '',
    description: d.description ?? '',
    date: iso(d.date),
    createdAt: iso(d.createdAt),
    createdBy: d.createdBy ?? '',
  };
}

function recordToDto(row, fallbackEventId = '') {
  const d = parseJson(row.data);
  return {
    id: row.id,
    eventId: d.eventId ?? fallbackEventId,
    userEmail: d.userEmail ?? d.useEmail ?? '',
    checkedInAt: iso(d.checkedInAt),
  };
}

// ---------- events ----------
async function listEvents(env) {
  const { results } = await env.DB.prepare('SELECT * FROM fs_attendanceEvents').all();
  const items = results.map(eventToDto);
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return json({ data: items });
}

async function getEvent(env, id) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM fs_attendanceEvents WHERE id = ?'
  )
    .bind(id)
    .all();
  if (!results.length) return json({ error: 'Event tidak ditemukan' }, 404);
  return json(eventToDto(results[0]));
}

async function createEvent(env, body, user) {
  const title = String(body.title ?? '').trim();
  if (!title) return json({ error: 'title wajib diisi' }, 400);

  const id = genId();
  const now = new Date().toISOString();
  const data = {
    title,
    description: String(body.description ?? '').trim(),
    date: body.date ? new Date(body.date).toISOString() : now,
    createdAt: now,
    updatedAt: null,
    createdBy: user.email,
  };
  await env.DB.prepare('INSERT INTO fs_attendanceEvents (id, data) VALUES (?,?)')
    .bind(id, JSON.stringify(data))
    .run();
  return json(eventToDto({ id, data: JSON.stringify(data) }), 201);
}

async function updateEvent(env, id, body) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM fs_attendanceEvents WHERE id = ?'
  )
    .bind(id)
    .all();
  if (!results.length) return json({ error: 'Event tidak ditemukan' }, 404);

  const d = parseJson(results[0].data);
  const next = {
    title: body.title !== undefined ? String(body.title).trim() : d.title,
    description:
      body.description !== undefined
        ? String(body.description).trim()
        : d.description ?? '',
    date: body.date ? new Date(body.date).toISOString() : d.date,
    createdAt: d.createdAt,
    updatedAt: new Date().toISOString(),
    createdBy: d.createdBy ?? '',
  };
  await env.DB.prepare('UPDATE fs_attendanceEvents SET data = ? WHERE id = ?')
    .bind(JSON.stringify(next), id)
    .run();
  return json(eventToDto({ id, data: JSON.stringify(next) }));
}

async function removeEvent(env, id) {
  await env.DB.prepare('DELETE FROM fs_attendanceEvents WHERE id = ?').bind(id).run();
  await env.DB.prepare(
    "DELETE FROM fs_attendanceRecords WHERE json_extract(data, '$.eventId') = ?"
  )
    .bind(id)
    .run();
  return json({ ok: true });
}

// ---------- records ----------
async function listRecords(env, eventId) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM fs_attendanceRecords WHERE json_extract(data, '$.eventId') = ?"
  )
    .bind(eventId)
    .all();
  const items = results.map((r) => recordToDto(r, eventId));
  items.sort(
    (a, b) =>
      new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime()
  );
  return json({ data: items });
}

async function checkIn(env, eventId, body) {
  const event = await env.DB.prepare(
    'SELECT id FROM fs_attendanceEvents WHERE id = ?'
  )
    .bind(eventId)
    .all();
  if (!event.results.length) {
    return json({ message: 'Event tidak ditemukan.' }, 404);
  }

  const userEmail = String(body.userEmail ?? '').trim().toLowerCase();
  if (!userEmail) return json({ message: 'Email wajib diisi.' }, 400);

  const existing = await env.DB.prepare(
    "SELECT id FROM fs_attendanceRecords WHERE json_extract(data, '$.eventId') = ? AND LOWER(json_extract(data, '$.userEmail')) = ?"
  )
    .bind(eventId, userEmail)
    .all();
  if (existing.results.length) {
    return json({ message: 'Anda sudah check-in.' }, 409);
  }

  const id = genId();
  const data = {
    eventId,
    userEmail,
    checkedInAt: new Date().toISOString(),
  };
  await env.DB.prepare('INSERT INTO fs_attendanceRecords (id, data) VALUES (?,?)')
    .bind(id, JSON.stringify(data))
    .run();

  return json({ message: 'Check-in berhasil!', record: recordToDto({ id, data: JSON.stringify(data) }, eventId) }, 201);
}

// ---------- router ----------
export async function handleAttendance(request, env, url) {
  const path = url.pathname;
  try {
    const listMatch = path === '/api/attendance/events' || path === '/api/attendance/events/';
    const eventMatch = path.match(/^\/api\/attendance\/events\/([^/]+)$/);
    const subMatch = path.match(/^\/api\/attendance\/events\/([^/]+)\/(records|checkin)$/);

    if (listMatch && request.method === 'GET') return await listEvents(env);
    if (listMatch && request.method === 'POST') {
      const guard = await requireAdmin(request, env);
      if (guard.error) return guard.error;
      return await createEvent(env, await request.json(), guard.user);
    }

    if (subMatch) {
      const [, eventId, sub] = subMatch;
      if (sub === 'records' && request.method === 'GET') {
        return await listRecords(env, eventId);
      }
      if (sub === 'checkin' && request.method === 'POST') {
        const guard = await requireUser(request);
        if (guard.error) return guard.error;
        return await checkIn(env, eventId, await request.json());
      }
      return json({ error: 'Method not allowed' }, 405);
    }

    if (eventMatch) {
      const id = eventMatch[1];
      if (request.method === 'GET') return await getEvent(env, id);
      if (request.method === 'PUT' || request.method === 'PATCH') {
        const guard = await requireAdmin(request, env);
        if (guard.error) return guard.error;
        return await updateEvent(env, id, await request.json());
      }
      if (request.method === 'DELETE') {
        const guard = await requireAdmin(request, env);
        if (guard.error) return guard.error;
        return await removeEvent(env, id);
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
