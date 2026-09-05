// API komentar (Cloudflare Worker, D1). Data: fs_comments (dokumen JSON).
//
// Endpoint:
//   GET  /api/comments?resourceType=&resourceId=  -> daftar komentar (asc)
//   POST /api/comments                            -> tambah komentar   [user login]

import { requireUser } from './auth';
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

function rowToComment(row) {
  let data = {};
  try {
    data = row.data ? JSON.parse(row.data) : {};
  } catch {
    data = {};
  }

  let createdAt = data.createdAt;
  if (!createdAt && data.createdAtTs) {
    if (typeof data.createdAtTs === 'object' && data.createdAtTs.seconds) {
      createdAt = new Date(
        Number(data.createdAtTs.seconds) * 1000
      ).toISOString();
    } else {
      createdAt = String(data.createdAtTs);
    }
  }
  if (!createdAt) createdAt = new Date().toISOString();

  return {
    id: row.id,
    resourceType: data.resourceType,
    resourceId: data.resourceId,
    userId: data.userId,
    userName: data.userName,
    userPhotoURL: data.userPhotoURL || undefined,
    comment: data.comment,
    createdAt,
  };
}

async function listComments(env, url) {
  const resourceType = url.searchParams.get('resourceType');
  const resourceId = url.searchParams.get('resourceId');
  if (!resourceType || !resourceId) {
    return json({ error: 'resourceType & resourceId wajib diisi' }, 400);
  }

  const { results } = await env.DB.prepare(
    `SELECT * FROM fs_comments
     WHERE json_extract(data, '$.resourceType') = ?
       AND json_extract(data, '$.resourceId') = ?`
  )
    .bind(resourceType, resourceId)
    .all();

  const items = results.map(rowToComment);
  items.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  return json({ data: items });
}

async function createComment(env, body, user) {
  const resourceType = String(body.resourceType ?? '').trim();
  const resourceId = String(body.resourceId ?? '').trim();
  const comment = String(body.comment ?? '').trim();
  if (!resourceType || !resourceId || !comment) {
    return json({ error: 'resourceType, resourceId & comment wajib diisi' }, 400);
  }

  const id = genId();
  const data = {
    resourceType,
    resourceId,
    userId: user.uid,
    userName: user.name,
    email: user.email,
    userPhotoURL: body.userPhotoURL || null,
    comment,
    createdAt: new Date().toISOString(),
  };

  await env.DB.prepare('INSERT INTO fs_comments (id, data) VALUES (?,?)')
    .bind(id, JSON.stringify(data))
    .run();

  return json(rowToComment({ id, data: JSON.stringify(data) }), 201);
}

export async function handleComments(request, env, url) {
  try {
    if (request.method === 'GET' && url.pathname === '/api/comments') {
      return await listComments(env, url);
    }
    if (request.method === 'POST' && url.pathname === '/api/comments') {
      const guard = await requireUser(request);
      if (guard.error) return guard.error;
      return await createComment(env, await request.json(), guard.user);
    }
    return json({ error: 'Not found' }, 404);
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      500
    );
  }
}
