// Cloudflare Worker: API pembaca D1 utk data santri & wali santri.
// Endpoint:
//   GET /api/tahun-ajaran?tahun=2025/2026   -> bentuk mirip tahun_ajaran_*.json
//   GET /api/wali                            -> bentuk mirip data_wali_santri.json
//   GET /api/health                          -> { ok: true }

import { handleAttendance } from './attendance';
import { listAdmins, meStatus } from './auth';
import { handleComments } from './comments';
import { handleContent } from './content';
import { handleDonations } from './donations';
import { handleKelas } from './kelas';
import { handlePresence } from './presence';
import { handleQuizzes } from './quizzes';
import { handleUpload } from './uploads';
import { json } from './json';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
      if (path.startsWith('/api/presence')) {
        return await handlePresence(request, env, url);
      }
      if (path.startsWith('/api/upload')) {
        return await handleUpload(request, env, url);
      }
      if (path.startsWith('/api/comments')) {
        return await handleComments(request, env, url);
      }
      if (path.startsWith('/api/comments')) {
        return await handleComments(request, env, url);
      }
      if (path.startsWith('/api/wakaf-kelas')) {
        return await handleKelas(request, env, url);
      }
      if (path.startsWith('/api/news') || path.startsWith('/api/events') || path.startsWith('/api/podcasts')) {
        return await handleContent(request, env, url);
      }
      if (path.startsWith('/api/quizzes')) {
        return await handleQuizzes(request, env, url);
      }
      if (path.startsWith('/api/donations')) {
        return await handleDonations(request, env, url);
      }
      if (path === '/api/health') {
        return json({ ok: true, time: new Date().toISOString() });
      }
      if (path === '/api/me') {
        return meStatus(request, env);
      }
      if (path === '/api/admins') {
        return listAdmins(env);
      }
      if (path === '/api/tahun-ajaran') {
        return await serveCached(request, ctx, CACHE_7D, () =>
          handleTahunAjaran(env, url)
        );
      }
      if (path === '/api/wali') {
        return await serveCached(request, ctx, CACHE_7D, () =>
          handleWali(env, url)
        );
      }
      return json({ error: 'Not found' }, 404);
    } catch (err) {
      return json(
        { error: err instanceof Error ? err.message : 'Internal error' },
        500
      );
    }
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

const CACHE_7D = 60 * 60 * 24 * 7; // 1 minggu
const CACHE_CLIENT_MAX_AGE = 300; // browser menyimpan singkat (5 mnt)

// Respons JSON yang di-cache di edge (Cache API). Data santri/wali jarang
// berubah (di-refresh via ETL), jadi setelah dimuat disajikan dari cache
// hingga ttlSeconds. Gunakan query `?refresh=1` utk memaksa ambil data baru
// dan memperbarui cache.
async function serveCached(request, ctx, ttlSeconds, build) {
  const bypass = new URL(request.url).searchParams.get('refresh') === '1';
  const cache = caches.default;
  const cacheKey = new Request(request.url, request);

  if (!bypass) {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const ts = Number(cached.headers.get('x-cache-ts') || 0);
        if (!ts || Date.now() - ts < ttlSeconds * 1000) return cached;
        // sudah lewat umur — buang lalu ambil ulang
        ctx.waitUntil(cache.delete(cacheKey).catch(() => {}));
      }
    } catch {
      // cache tak tersedia — lanjut hit DB
    }
  }

  const resp = await build();
  if (!resp || resp.status !== 200) return resp;

  const body = await resp.text();
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': `public, s-maxage=${ttlSeconds}, max-age=${CACHE_CLIENT_MAX_AGE}`,
    'x-cache-ts': String(Date.now()),
    ...corsHeaders(),
  };
  if (!bypass) {
    try {
      ctx.waitUntil(
        cache.put(cacheKey, new Response(body, { status: 200, headers }))
      );
    } catch {
      // gagal menulis cache — respons tetap dikembalikan
    }
  }
  return new Response(body, { status: 200, headers });
}

// ---------- helpers ----------
function err(message, status = 400) {
  return json({ error: message }, status);
}

// ---------- pencarian keluarga (wali) utk melengkapi data santri ----------
const normName = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function buildWaliIndex(rows) {
  const byId = new Map();
  const byAyah = new Map();
  const byIbu = new Map();
  const byChild = new Map();
  const add = (m, key, id) => {
    if (!key) return;
    const arr = m.get(key) || [];
    arr.push(id);
    m.set(key, arr);
  };
  for (const w of rows) {
    byId.set(w.id, w);
    add(byAyah, normName(w.nama_ayah), w.id);
    add(byIbu, normName(w.nama_ibu), w.id);
    for (const child of String(w.nama_anak_raw || '').split(','))
      add(byChild, normName(child), w.id);
  }
  return { byId, byAyah, byIbu, byChild };
}

function findWali(index, st) {
  const cand = st.id_wali != null ? index.byId.get(st.id_wali) : null;
  if (cand) return cand;
  const pick = (m, key) => {
    if (!key) return null;
    const ids = m.get(key) || [];
    return ids.length === 1 ? index.byId.get(ids[0]) : null;
  };
  return (
    pick(index.byAyah, normName(st.ayah)) ||
    pick(index.byIbu, normName(st.bunda)) ||
    pick(index.byChild, normName(st.nama)) ||
    null
  );
}

// ---------- /api/tahun-ajaran ----------
async function handleTahunAjaran(env, url) {
  const tahun = url.searchParams.get('tahun') || null;

  const taRows = await env.DB.prepare(
    'SELECT id, nama FROM tahun_ajaran ORDER BY tahun_mulai'
  ).all();
  const tahunList = taRows.results;
  const taIdByName = new Map(tahunList.map((t) => [t.nama, t.id]));
  const namaTahun = tahun ? [tahun] : tahunList.map((t) => t.nama);
  const taIds = namaTahun
    .map((n) => taIdByName.get(n))
    .filter((id) => id != null);
  if (taIds.length === 0) {
    return json({ tahun_ajaran: namaTahun, data: [] });
  }
  const inTa = taIds.map(() => '?').join(', ');

  // indeks keluarga (wali santri) utk fallback nama ortu + bidang pekerjaan
  const waliRows = await env.DB.prepare(
    `SELECT id, nama_ayah, nama_ibu, pekerjaan_utama_ayah,
            bidang_pekerjaan_ayah, instansi, nama_anak_raw
     FROM wali_santri`
  ).all();
  const waliIndex = buildWaliIndex(waliRows.results);

  // --- ambil semua data dgn 3 query (tanpa N+1) ---
  const enrollRes = await env.DB.prepare(
    `SELECT e.tahun_ajaran_id AS ta_id, k.id AS kelas_id, k.nama AS kelas,
            e.status_akademik AS status,
            s.id AS santri_id, s.nama, s.nama_ayah AS ayah, s.nama_bunda AS bunda,
            s.kode_registrasi, s.tahun_masuk AS academic_year, s.id_wali
     FROM enrollment e
     JOIN kelas k ON k.id = e.kelas_id
     JOIN santri s ON s.id = e.santri_id
     WHERE e.tahun_ajaran_id IN (${inTa})
     ORDER BY k.program_id, k.grade, k.letter, s.nama`
  )
    .bind(...taIds)
    .all();

  const guruRes = await env.DB.prepare(
    `SELECT kg.tahun_ajaran_id AS ta_id, kg.kelas_id, kg.peran,
            g.nama AS name, g.telepon AS phone
     FROM kelas_guru kg
     JOIN guru g ON g.id = kg.guru_id
     WHERE kg.tahun_ajaran_id IN (${inTa})
     ORDER BY kg.tahun_ajaran_id, kg.kelas_id, kg.id`
  )
    .bind(...taIds)
    .all();

  const sibRes = await env.DB.prepare(
    `SELECT santri_id, nama_teks AS name, kelas_teks AS class,
            tahun_teks AS academic_year
     FROM saudara ORDER BY santri_id`
  ).all();

  // saudara dikelompokkan per santri
  const sibsBySantri = new Map();
  for (const s of sibRes.results) {
    const arr = sibsBySantri.get(s.santri_id) || [];
    arr.push({ name: s.name, class: s.class, academic_year: s.academic_year });
    sibsBySantri.set(s.santri_id, arr);
  }

  // kelas per tahun ajaran (urut sesuai kemunculan pertama di enrollment)
  const classesByKey = new Map();
  const order = [];
  for (const r of enrollRes.results) {
    const key = `${r.ta_id}:${r.kelas_id}`;
    let c = classesByKey.get(key);
    if (!c) {
      c = { taId: r.ta_id, name: r.kelas, teachers: [], students: [] };
      classesByKey.set(key, c);
      order.push(key);
    }
    const w = findWali(waliIndex, r);
    const ayah = r.ayah || (w && w.nama_ayah) || null;
    const bunda = r.bunda || (w && w.nama_ibu) || null;
    const siblings = sibsBySantri.get(r.santri_id);
    c.students.push({
      name: r.nama,
      ayah,
      bunda,
      pekerjaanAyah: (w && w.pekerjaan_utama_ayah) || null,
      bidangAyah: (w && w.bidang_pekerjaan_ayah) || null,
      instansiAyah: (w && w.instansi) || null,
      academic_year: r.academic_year,
      kode_registrasi: r.kode_registrasi,
      siblings: siblings && siblings.length ? siblings : null,
      status: r.status,
    });
  }

  for (const r of guruRes.results) {
    const c = classesByKey.get(`${r.ta_id}:${r.kelas_id}`);
    if (!c) continue;
    c.teachers.push({ role: r.peran, name: r.name, phone: r.phone });
  }

  const data = [];
  for (const ta of tahunList) {
    if (tahun && ta.nama !== tahun) continue;
    for (const key of order) {
      if (classesByKey.get(key).taId !== ta.id) continue;
      const c = classesByKey.get(key);
      data.push({ name: c.name, teachers: c.teachers, students: c.students });
    }
  }

  return json({ tahun_ajaran: namaTahun, data });
}

// ---------- /api/wali ----------
async function handleWali(env, url) {
  const q = url.searchParams.get('q');
  const kategori = url.searchParams.get('kategori');

  let sql = `SELECT * FROM wali_santri`;
  const cond = [];
  const args = [];
  if (q) {
    cond.push(`(LOWER(nama_ayah) LIKE ? OR LOWER(nama_ibu) LIKE ? OR LOWER(email) LIKE ? OR LOWER(nama_anak_raw) LIKE ?)`);
    const like = '%' + q.toLowerCase() + '%';
    args.push(like, like, like, like);
  }
  if (kategori) {
    cond.push(`kategori = ?`);
    args.push(kategori);
  }
  if (cond.length) sql += ' WHERE ' + cond.join(' AND ');
  sql += ' ORDER BY id';

  const { results } = await env.DB.prepare(sql)
    .bind(...args)
    .all();

  // bentuk ulang sesuai shape data_wali_santri.json
  const rows = results.map((r) => ({
    id: r.id,
    id_sumber: r.id_sumber,
    email: r.email,
    nama_ayah: r.nama_ayah,
    no_hp_ayah: r.no_hp_ayah,
    nama_ibu: r.nama_ibu,
    no_hp_ibu: r.no_hp_ibu,
    nama_anak: r.nama_anak_raw,
    kelas_anak: r.kelas_anak_raw,
    alamat_rumah: r.alamat,
    lat: r.lat,
    lon: r.lon,
    pekerjaan_utama_ayah: r.pekerjaan_utama_ayah,
    nama_instansi: r.instansi,
    bidang_pekerjaan_ayah: r.bidang_pekerjaan_ayah,
    peran_di_pekerjaan: r.peran_di_pekerjaan,
    keahlian_ayah: r.keahlian_ayah,
    hobi_minat: r.hobi_minat,
    kategori: r.kategori,
    subkategori: r.subkategori,
    ayah_bersedia_posku: r.ayah_bersedia_posku,
    bidang_diminati_ayah: r.ayah_bidang_diminati,
    ayah_pernah_panitia_posku: r.ayah_pernah_panitia,
    kegiatan_ayah: r.ayah_kegiatan,
    ibu_bersedia_posku: r.ibu_bersedia_posku,
    bidang_diminati_ibu: r.ibu_bidang_diminati,
    ibu_pernah_panitia_posku: r.ibu_pernah_panitia,
    kegiatan_ibu: r.ibu_kegiatan,
    ayah_bersedia_tawaf: r.ayah_bersedia_tawaf,
    kontribusi_tawaf: r.kontribusi_tawaf,
    saran_masukan: r.saran_masukan,
  }));

  return json({ data: rows, count: rows.length });
}
