// API konten (Cloudflare Worker, D1): news & events (public read + admin CRUD) & podcasts (read).
// Data sumber: fs_news_item / fs_event / fs_podcasts.
//
// Endpoint:
//   GET  /api/news | /api/events | /api/podcasts         -> daftar
//   GET  /api/news/:idOrSlug | /api/events/:idOrSlug     -> detail (id/slug/slug-judul)
//   POST /api/news | /api/events                         -> buat        [admin]
//   PUT  /api/news/:id | /api/events/:id                 -> perbarui    [admin]

import { requireAdmin } from './auth';
import { json } from './json';

const parseArr = (s) => {
  try {
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
};

const bool = (n) => (n === 1 || n === true ? true : false);

function genId() {
  const abc =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += abc[b % abc.length];
  return s;
}

function slugify(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---------- mapping baris -> objek publik ----------
function newsRow(r) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    imageUrls: parseArr(r.image_urls),
    publishDate: r.publish_date,
    author: r.author,
    isPublished: bool(r.is_published),
  };
}

function eventRow(r) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    imageUrls: parseArr(r.image_urls),
    startDate: r.start_date,
    endDate: r.end_date,
    location: r.location,
    isActive: bool(r.is_active),
  };
}

// ---------- resolver id/slug ----------
async function resolveNews(env, ref) {
  const byId = await env.DB.prepare('SELECT * FROM fs_news_item WHERE id = ?')
    .bind(ref)
    .all();
  if (byId.results.length) return byId.results[0];

  const bySlug = await env.DB.prepare('SELECT * FROM fs_news_item WHERE slug = ?')
    .bind(ref)
    .all();
  if (bySlug.results.length) return bySlug.results[0];

  const all = await env.DB.prepare('SELECT * FROM fs_news_item').all();
  for (const r of all.results) {
    if (r.title && slugify(r.title) === ref) return r;
  }
  return null;
}

async function resolveEvent(env, ref) {
  const byId = await env.DB.prepare('SELECT * FROM fs_event WHERE id = ?')
    .bind(ref)
    .all();
  if (byId.results.length) return byId.results[0];

  const bySlug = await env.DB.prepare('SELECT * FROM fs_event WHERE slug = ?')
    .bind(ref)
    .all();
  if (bySlug.results.length) return bySlug.results[0];

  const all = await env.DB.prepare('SELECT * FROM fs_event').all();
  for (const r of all.results) {
    if (r.title && slugify(r.title) === ref) return r;
  }
  return null;
}

// ---------- daftar ----------
async function listNews(env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM fs_news_item
     ORDER BY (publish_date IS NULL), publish_date DESC`
  ).all();
  return json({ data: results.map(newsRow), count: results.length });
}

async function listEvents(env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM fs_event
     ORDER BY (start_date IS NULL), start_date DESC`
  ).all();
  return json({ data: results.map(eventRow), count: results.length });
}

async function listPodcasts(env) {
  const { results } = await env.DB.prepare('SELECT id, data FROM fs_podcasts').all();
  const data = results.map((r) => {
    let parsed = {};
    try {
      parsed = r.data ? JSON.parse(r.data) : {};
    } catch {
      parsed = {};
    }
    return { id: r.id, ...parsed };
  });
  return json({ data, count: data.length });
}

// ---------- tulis news / events ----------
function activity(env) {
  return {
    type: 'admin',
    insert: (
      kind,
      resourceId,
      type,
      description,
      user
    ) =>
      env.DB.prepare(
        kind === 'news'
          ? `INSERT INTO fs_news_activity (news_id, user_id, user_name, type, description, datetime)
             VALUES (?,?,?,?,?,?)`
          : `INSERT INTO fs_event_activity (event_id, user_id, user_name, type, description, datetime)
             VALUES (?,?,?,?,?,?)`
      ).bind(
        resourceId,
        user.uid,
        user.name,
        type,
        description,
        new Date().toISOString()
      ),
  };
}

async function createItem(env, kind, body, user) {
  const title = String(body.title ?? '').trim();
  if (!title) return json({ error: `${kind} title wajib diisi` }, 400);

  const id = genId();
  const now = new Date().toISOString();

  const newsCols = {
    slug: body.slug ?? null,
    title,
    summary: body.summary ?? null,
    image_urls: JSON.stringify(body.imageUrls ?? []),
    publish_date: body.publishDate ?? now,
    author: body.author ?? null,
    is_published: body.isPublished ? 1 : 0,
  };
  const eventCols = {
    slug: body.slug ?? null,
    title,
    summary: body.summary ?? null,
    image_urls: JSON.stringify(body.imageUrls ?? []),
    start_date: body.startDate ?? null,
    end_date: body.endDate ?? null,
    location: body.location ?? null,
    is_active: body.isActive ? 1 : 0,
    published: body.published === undefined ? 1 : body.published ? 1 : 0,
  };

  const cols = kind === 'news' ? newsCols : eventCols;
  const keys = Object.keys(cols);
  const placeholders = keys.map(() => '?').join(', ');

  const table = kind === 'news' ? 'fs_news_item' : 'fs_event';
  await env.DB.prepare(
    `INSERT INTO ${table} (id, ${keys.join(', ')}) VALUES (?, ${placeholders})`
  )
    .bind(id, ...keys.map((k) => cols[k]))
    .run();

  await activity(env).insert(
    kind,
    id,
    'add',
    `Menambahkan ${kind === 'news' ? 'berita' : 'acara'} ${title}`,
    user
  ).run();

  const row = await (kind === 'news' ? resolveNews : resolveEvent)(env, id);
  return json(kind === 'news' ? newsRow(row) : eventRow(row), 201);
}

async function updateItem(env, kind, id, body, user) {
  const row = await (kind === 'news' ? resolveNews : resolveEvent)(env, id);
  if (!row) return json({ error: 'Not found' }, 404);

  const cols =
    kind === 'news'
      ? {
          slug: body.slug !== undefined ? body.slug : row.slug,
          title: body.title !== undefined ? body.title : row.title,
          summary: body.summary !== undefined ? body.summary : row.summary,
          image_urls:
            body.imageUrls !== undefined
              ? JSON.stringify(body.imageUrls)
              : row.image_urls,
          publish_date:
            body.publishDate !== undefined ? body.publishDate : row.publish_date,
          author: body.author !== undefined ? body.author : row.author,
          is_published:
            body.isPublished !== undefined
              ? body.isPublished
                ? 1
                : 0
              : row.is_published,
        }
      : {
          slug: body.slug !== undefined ? body.slug : row.slug,
          title: body.title !== undefined ? body.title : row.title,
          summary: body.summary !== undefined ? body.summary : row.summary,
          image_urls:
            body.imageUrls !== undefined
              ? JSON.stringify(body.imageUrls)
              : row.image_urls,
          start_date:
            body.startDate !== undefined ? body.startDate : row.start_date,
          end_date: body.endDate !== undefined ? body.endDate : row.end_date,
          location: body.location !== undefined ? body.location : row.location,
          is_active:
            body.isActive !== undefined
              ? body.isActive
                ? 1
                : 0
              : row.is_active,
          published:
            body.published !== undefined
              ? body.published
                ? 1
                : 0
              : row.published,
        };

  const keys = Object.keys(cols);
  const set = keys.map((k) => `${k} = ?`).join(', ');
  const table = kind === 'news' ? 'fs_news_item' : 'fs_event';
  await env.DB.prepare(`UPDATE ${table} SET ${set} WHERE id = ?`)
    .bind(...keys.map((k) => cols[k]), row.id)
    .run();

  await activity(env).insert(
    kind,
    row.id,
    'edit',
    `Mengubah ${kind === 'news' ? 'berita' : 'acara'}: ${keys.join(', ')}`,
    user
  ).run();

  const fresh = await (kind === 'news' ? resolveNews : resolveEvent)(env, row.id);
  return json(kind === 'news' ? newsRow(fresh) : eventRow(fresh));
}

// ---------- newsletter ----------
function newsletterRow(r) {
  return {
    id: r.id,
    order: r.sort_order === null ? undefined : Number(r.sort_order),
    title: r.title,
    image_url: r.image_url,
    document_url: r.document_url,
  };
}

async function listNewsletters(env) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM fs_newsletter ORDER BY (sort_order IS NULL), sort_order ASC'
  ).all();
  return json({ data: results.map(newsletterRow), count: results.length });
}

async function createNewsletter(env, body) {
  const title = String(body.title ?? '').trim();
  if (!title) return json({ error: 'title wajib diisi' }, 400);
  const id = genId();
  await env.DB.prepare(
    `INSERT INTO fs_newsletter (id, title, sort_order, image_url, document_url)
     VALUES (?,?,?,?,?)`
  )
    .bind(id, title, body.order ?? 0, body.image_url ?? null, body.document_url ?? null)
    .run();
  return json(newsletterRow({ id, sort_order: body.order ?? 0, title, image_url: body.image_url ?? null, document_url: body.document_url ?? null }), 201);
}

async function updateNewsletter(env, id, body) {
  const exists = await env.DB.prepare('SELECT id FROM fs_newsletter WHERE id = ?')
    .bind(id)
    .all();
  if (exists.results.length === 0) return json({ error: 'Not found' }, 404);
  await env.DB.prepare(
    `UPDATE fs_newsletter SET title = ?, sort_order = ?, image_url = ?, document_url = ? WHERE id = ?`
  )
    .bind(body.title ?? null, body.order ?? 0, body.image_url ?? null, body.document_url ?? null, id)
    .run();
  const { results } = await env.DB.prepare('SELECT * FROM fs_newsletter WHERE id = ?')
    .bind(id)
    .all();
  return json(newsletterRow(results[0]));
}

async function removeNewsletter(env, id) {
  await env.DB.prepare('DELETE FROM fs_newsletter WHERE id = ?').bind(id).run();
  return json({ ok: true });
}

// ---------- router ----------
export async function handleContent(request, env, url) {
  const path = url.pathname;
  try {
    const newsletterList = path === '/api/newsletters' || path === '/api/newsletters/';
    const newsletterMatch = path.match(/^\/api\/newsletters\/([^/]+)$/);

    if (newsletterList && request.method === 'GET') return await listNewsletters(env);
    if (newsletterList && request.method === 'POST') {
      const guard = await requireAdmin(request, env);
      if (guard.error) return guard.error;
      return await createNewsletter(env, await request.json());
    }
    if (newsletterMatch && (request.method === 'PUT' || request.method === 'PATCH')) {
      const guard = await requireAdmin(request, env);
      if (guard.error) return guard.error;
      return await updateNewsletter(env, decodeURIComponent(newsletterMatch[1]), await request.json());
    }
    if (newsletterMatch && request.method === 'DELETE') {
      const guard = await requireAdmin(request, env);
      if (guard.error) return guard.error;
      return await removeNewsletter(env, decodeURIComponent(newsletterMatch[1]));
    }

    const newsList = path === '/api/news' || path === '/api/news/';
    const eventList = path === '/api/events' || path === '/api/events/';
    const newsMatch = path.match(/^\/api\/news\/([^/]+)$/);
    const eventMatch = path.match(/^\/api\/events\/([^/]+)$/);

    // tulis
    if (newsList && request.method === 'POST') {
      const guard = await requireAdmin(request, env);
      if (guard.error) return guard.error;
      return await createItem(env, 'news', await request.json(), guard.user);
    }
    if (eventList && request.method === 'POST') {
      const guard = await requireAdmin(request, env);
      if (guard.error) return guard.error;
      return await createItem(env, 'events', await request.json(), guard.user);
    }
    if (newsMatch && (request.method === 'PUT' || request.method === 'PATCH')) {
      const guard = await requireAdmin(request, env);
      if (guard.error) return guard.error;
      const body = await request.json();
      return await updateItem(env, 'news', decodeURIComponent(newsMatch[1]), body, guard.user);
    }
    if (eventMatch && (request.method === 'PUT' || request.method === 'PATCH')) {
      const guard = await requireAdmin(request, env);
      if (guard.error) return guard.error;
      const body = await request.json();
      return await updateItem(env, 'events', decodeURIComponent(eventMatch[1]), body, guard.user);
    }

    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405);
    }

    if (newsList) return await listNews(env);
    if (eventList) return await listEvents(env);
    if (path === '/api/podcasts' || path === '/api/podcasts/')
      return await listPodcasts(env);

    if (newsMatch) {
      const row = await resolveNews(env, decodeURIComponent(newsMatch[1]));
      return row ? json(newsRow(row)) : json({ error: 'Not found' }, 404);
    }
    if (eventMatch) {
      const row = await resolveEvent(env, decodeURIComponent(eventMatch[1]));
      return row ? json(eventRow(row)) : json({ error: 'Not found' }, 404);
    }

    return json({ error: 'Not found' }, 404);
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      500
    );
  }
}
