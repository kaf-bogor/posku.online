// API donations (Cloudflare Worker, D1). Data sumber: tabel ternormalisasi
// fs_donation / fs_donor / fs_donation_activity.
//
// Endpoint:
//   GET    /api/donations?active=1|0        -> daftar campaign (bentuk DonationPage)
//   GET    /api/donations/:idOrSlug         -> 1 campaign (cari id, lalu slug, lalu slug dari title)
//   POST   /api/donations                   -> buat campaign baru            [admin]
//   PUT    /api/donations/:id               -> update field campaign + log    [admin]
//   DELETE /api/donations/:id               -> hapus campaign (donors/activity) [admin]
//   POST   /api/donations/:id/donors        -> replace daftar donatur         [admin]
//   POST   /api/donations/reorder           -> set urutan (order) campaign    [admin]
//
// Mutasi butuh header: Authorization: Bearer <Firebase ID Token>.
// Admin = email (dari token) terdaftar di tabel fs_admin.

import { requireAdmin } from './auth';
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

// replica generateSlug (src/lib/utils/slug.ts) agar URL lama tetap bisa resolve
function generateSlug(text) {
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

const toBool = (n) => (n === 1 || n === true ? true : false);
const num = (n) => (n === null || n === undefined ? 0 : Number(n));

function parseJsonArrField(col) {
  try {
    return col ? JSON.parse(col) : [];
  } catch {
    return [];
  }
}

// ---------- helpers data ----------
async function getCampaign(env, id) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM fs_donation WHERE id = ?'
  )
    .bind(id)
    .all();
  if (results.length === 0) return null;
  return rowToCampaign(env, results[0]);
}

async function rowToCampaign(env, row) {
  const donorRes = await env.DB.prepare(
    `SELECT source_id, name, value, donors_count, datetime
     FROM fs_donor WHERE donation_id = ?
     ORDER BY (datetime IS NULL), datetime DESC`
  )
    .bind(row.id)
    .all();

  const actRes = await env.DB.prepare(
    `SELECT user_id, user_name, type, description, datetime
     FROM fs_donation_activity WHERE donation_id = ? ORDER BY id ASC`
  )
    .bind(row.id)
    .all();

  const donors = donorRes.results.map((d) => ({
    id: d.source_id,
    name: d.name,
    value: num(d.value),
    donorsCount: d.donors_count === null ? undefined : Number(d.donors_count),
    datetime: d.datetime,
  }));

  const donorsCount = donors.reduce(
    (sum, d) => sum + (Number(d.donorsCount) || 1),
    0
  );

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    imageUrls: parseJsonArrField(row.image_urls),
    order: row.sort_order === null ? undefined : Number(row.sort_order),
    target: num(row.target),
    link: row.link,
    published: toBool(row.published),
    is_active: toBool(row.is_active),
    organizer: {
      avatar: row.organizer_avatar,
      name: row.organizer_name,
      tagline: row.organizer_tagline,
    },
    donors,
    donorsCount,
    activities: actRes.results.map((a) => ({
      userId: a.user_id,
      userName: a.user_name,
      type: a.type,
      description: a.description,
      datetime: a.datetime,
    })),
  };
}

async function resolveCampaignId(env, idOrSlug) {
  const byId = await env.DB.prepare('SELECT id FROM fs_donation WHERE id = ?')
    .bind(idOrSlug)
    .all();
  if (byId.results.length > 0) return byId.results[0].id;

  const bySlug = await env.DB.prepare(
    'SELECT id FROM fs_donation WHERE slug = ?'
  )
    .bind(idOrSlug)
    .all();
  if (bySlug.results.length > 0) return bySlug.results[0].id;

  // legacy: campaign tanpa slug, URL pakai generateSlug(title)
  const { results } = await env.DB.prepare(
    'SELECT id, title FROM fs_donation'
  ).all();
  for (const r of results) {
    if (r.title && generateSlug(r.title) === idOrSlug) return r.id;
  }
  return null;
}

// ---------- handlers ----------
async function listDonations(env, url) {
  const activeParam = url.searchParams.get('active');
  const where =
    activeParam === '1' || activeParam === 'true'
      ? 'WHERE is_active = 1'
      : activeParam === '0' || activeParam === 'false'
        ? 'WHERE is_active = 0'
        : '';

  const { results } = await env.DB.prepare(
    `SELECT * FROM fs_donation ${where}
     ORDER BY (sort_order IS NULL), sort_order ASC`
  ).all();

  const campaigns = [];
  for (const row of results) {
    campaigns.push(await rowToCampaign(env, row));
  }
  return json({ data: campaigns, count: campaigns.length });
}

async function getOne(env, idOrSlug) {
  const id = await resolveCampaignId(env, idOrSlug);
  if (!id) return json({ error: 'Not found' }, 404);
  const campaign = await getCampaign(env, id);
  return campaign ? json(campaign) : json({ error: 'Not found' }, 404);
}

async function create(env, body, user) {
  const title = String(body.title ?? '').trim();
  if (!title) return json({ error: 'title wajib diisi' }, 400);

  const id = genId();
  const now = Math.floor(Date.now() / 1000);
  const organizer = body.organizer ?? {};

  const activity = {
    user_id: user.uid,
    user_name: user.name,
    type: 'add',
    description: `Menambahkan donations ${title}`,
    datetime: new Date().toISOString(),
  };

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO fs_donation
         (id, slug, title, summary, target, link, image_urls, donors_count,
          sort_order, published, is_active, organizer_name, organizer_avatar,
          organizer_tagline, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      id,
      body.slug ?? null,
      title,
      body.summary ?? null,
      body.target ?? null,
      body.link ?? null,
      JSON.stringify(body.imageUrls ?? []),
      body.donorsCount ?? 0,
      body.order ?? null,
      body.published ? 1 : 0,
      body.is_active ? 1 : 0,
      organizer.name ?? null,
      organizer.avatar ?? null,
      organizer.tagline ?? null,
      now
    ),
    env.DB.prepare(
      `INSERT INTO fs_donation_activity
         (donation_id, user_id, user_name, type, description, datetime)
       VALUES (?,?,?,?,?,?)`
    ).bind(
      id,
      activity.user_id,
      activity.user_name,
      activity.type,
      activity.description,
      activity.datetime
    ),
  ]);

  const campaign = await getCampaign(env, id);
  return json(campaign, 201);
}

const FIELDS = [
  'slug',
  'title',
  'summary',
  'target',
  'link',
  'imageUrls',
  'order',
  'published',
  'is_active',
  'organizer',
];

async function update(env, body, id, user) {
  const exists = await getCampaign(env, id);
  if (!exists) return json({ error: 'Not found' }, 404);

  const organizer = body.organizer ?? {};

  const newValues = {
    slug: body.slug ?? null,
    title: body.title ?? null,
    summary: body.summary ?? null,
    target: body.target ?? null,
    link: body.link ?? null,
    image_urls: JSON.stringify(body.imageUrls ?? []),
    sort_order: body.order ?? null,
    published: body.published ? 1 : 0,
    is_active: body.is_active ? 1 : 0,
    organizer_name: organizer.name ?? null,
    organizer_avatar: organizer.avatar ?? null,
    organizer_tagline: organizer.tagline ?? null,
  };

  // diff (meniru perilaku lama di useCrudManager)
  const oldValues = {
    slug: exists.slug,
    title: exists.title,
    summary: exists.summary,
    target: exists.target,
    link: exists.link,
    imageUrls: exists.imageUrls,
    order: exists.order,
    published: exists.published,
    is_active: exists.is_active,
    organizer: exists.organizer,
  };

  const changedFields = [];
  FIELDS.forEach((key) => {
    const prevVal = oldValues[key];
    let nextVal = body[key];
    if (nextVal === undefined) return;

    if (key === 'organizer') nextVal = organizer;

    if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) {
      const isPrimitive = (v) =>
        v === null || ['string', 'number', 'boolean'].includes(typeof v);
      if (isPrimitive(prevVal) && isPrimitive(nextVal)) {
        changedFields.push(`${key}: ${prevVal ?? '–'} → ${nextVal}`);
      } else {
        changedFields.push(key);
      }
    }
  });

  const changeDesc =
    changedFields.length > 0 ? changedFields.join(', ') : 'No visible field change';

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE fs_donation SET
         slug = ?, title = ?, summary = ?, target = ?, link = ?, image_urls = ?,
         sort_order = ?, published = ?, is_active = ?, organizer_name = ?,
         organizer_avatar = ?, organizer_tagline = ?
       WHERE id = ?`
    ).bind(
      newValues.slug,
      newValues.title,
      newValues.summary,
      newValues.target,
      newValues.link,
      newValues.image_urls,
      newValues.sort_order,
      newValues.published,
      newValues.is_active,
      newValues.organizer_name,
      newValues.organizer_avatar,
      newValues.organizer_tagline,
      id
    ),
    env.DB.prepare(
      `INSERT INTO fs_donation_activity
         (donation_id, user_id, user_name, type, description, datetime)
       VALUES (?,?,?,?,?,?)`
    ).bind(
      id,
      user.uid,
      user.name,
      'edit',
      `Mengubah donations: ${changeDesc}`,
      new Date().toISOString()
    ),
  ]);

  const campaign = await getCampaign(env, id);
  return json(campaign);
}

async function remove(env, id) {
  const exists = await env.DB.prepare('SELECT id FROM fs_donation WHERE id = ?')
    .bind(id)
    .all();
  if (exists.results.length === 0) return json({ error: 'Not found' }, 404);

  await env.DB.batch([
    env.DB.prepare('DELETE FROM fs_donation_activity WHERE donation_id = ?').bind(
      id
    ),
    env.DB.prepare('DELETE FROM fs_donor WHERE donation_id = ?').bind(id),
    env.DB.prepare('DELETE FROM fs_donation WHERE id = ?').bind(id),
  ]);

  return json({ ok: true });
}

async function replaceDonors(env, body, id) {
  const exists = await env.DB.prepare('SELECT id FROM fs_donation WHERE id = ?')
    .bind(id)
    .all();
  if (exists.results.length === 0) return json({ error: 'Not found' }, 404);

  const donors = Array.isArray(body.donors) ? body.donors : [];
  const donorsCount = donors.reduce(
    (sum, d) => sum + (Number(d.donorsCount) || 1),
    0
  );

  const stmts = [
    env.DB.prepare('DELETE FROM fs_donor WHERE donation_id = ?').bind(id),
    env.DB.prepare('UPDATE fs_donation SET donors_count = ? WHERE id = ?').bind(
      donorsCount,
      id
    ),
  ];
  for (const d of donors) {
    stmts.push(
      env.DB.prepare(
        `INSERT INTO fs_donor (donation_id, source_id, name, value, donors_count, datetime)
         VALUES (?,?,?,?,?,?)`
      ).bind(
        id,
        d.id ?? null,
        d.name ?? null,
        d.value ?? null,
        d.donorsCount ?? null,
        d.datetime ?? null
      )
    );
  }

  // D1 batch dibatasi jumlah statement; pecah bila banyak donor.
  const MAX_BATCH = 90;
  for (let i = 0; i < stmts.length; i += MAX_BATCH) {
    await env.DB.batch(stmts.slice(i, i + MAX_BATCH));
  }

  const campaign = await getCampaign(env, id);
  return json({ donors: campaign.donors, donorsCount: campaign.donorsCount });
}

async function reorder(env, body) {
  const orders = Array.isArray(body.orders) ? body.orders : [];
  if (orders.length === 0) return json({ ok: true });

  const stmts = [];
  for (const o of orders) {
    if (!o || typeof o.id !== 'string') continue;
    stmts.push(
      env.DB.prepare('UPDATE fs_donation SET sort_order = ? WHERE id = ?').bind(
        Number(o.order) || 0,
        o.id
      )
    );
  }

  const MAX_BATCH = 90;
  for (let i = 0; i < stmts.length; i += MAX_BATCH) {
    await env.DB.batch(stmts.slice(i, i + MAX_BATCH));
  }
  return json({ ok: true });
}

// ---------- router ----------
export async function handleDonations(request, env, url) {
  const path = url.pathname;
  const idMatch = path.match(/^\/api\/donations\/([^/]+)\/donors$/);
  const singleMatch = path.match(/^\/api\/donations\/([^/]+)$/);

  try {
    if (path === '/api/donations' || path === '/api/donations/') {
      if (request.method === 'GET') return await listDonations(env, url);
      if (request.method === 'POST') {
        const guard = await requireAdmin(request, env);
        if (guard.error) return guard.error;
        const body = await request.json();
        return await create(env, body, guard.user);
      }
      return json({ error: 'Method not allowed' }, 405);
    }

    if (path === '/api/donations/reorder') {
      if (request.method === 'POST') {
        const guard = await requireAdmin(request, env);
        if (guard.error) return guard.error;
        const body = await request.json();
        return await reorder(env, body);
      }
      return json({ error: 'Method not allowed' }, 405);
    }

    if (idMatch) {
      const [, idOrSlug] = idMatch;
      if (request.method === 'POST') {
        const guard = await requireAdmin(request, env);
        if (guard.error) return guard.error;
        const resolved = await resolveCampaignId(env, idOrSlug);
        if (!resolved) return json({ error: 'Not found' }, 404);
        const body = await request.json();
        return await replaceDonors(env, body, resolved);
      }
      return json({ error: 'Method not allowed' }, 405);
    }

    if (singleMatch) {
      const [, idOrSlug] = singleMatch;
      if (request.method === 'GET') return await getOne(env, idOrSlug);
      if (request.method === 'PUT' || request.method === 'PATCH') {
        const guard = await requireAdmin(request, env);
        if (guard.error) return guard.error;
        const resolved = await resolveCampaignId(env, idOrSlug);
        if (!resolved) return json({ error: 'Not found' }, 404);
        const body = await request.json();
        return await update(env, body, resolved, guard.user);
      }
      if (request.method === 'DELETE') {
        const guard = await requireAdmin(request, env);
        if (guard.error) return guard.error;
        const resolved = await resolveCampaignId(env, idOrSlug);
        if (!resolved) return json({ error: 'Not found' }, 404);
        return await remove(env, resolved);
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
