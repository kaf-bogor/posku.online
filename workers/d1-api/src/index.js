// Cloudflare Worker: API pembaca D1 utk data santri & wali santri.
// Endpoint:
//   GET /api/tahun-ajaran?tahun=2025/2026   -> bentuk mirip tahun_ajaran_*.json
//   GET /api/wali                            -> bentuk mirip data_wali_santri.json
//   GET /api/health                          -> { ok: true }

import { handleAttendance } from './attendance';
import { meStatus } from './auth';
import { handleComments } from './comments';
import { handleContent } from './content';
import { handleDonations } from './donations';
import { handleKelas } from './kelas';
import { handleQuizzes } from './quizzes';
import { json } from './json';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
      if (path.startsWith('/api/attendance/')) {
        return await handleAttendance(request, env, url);
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
      if (path === '/api/tahun-ajaran') {
        return await handleTahunAjaran(env, url);
      }
      if (path === '/api/wali') {
        return await handleWali(env, url);
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

// ---------- helpers ----------
function err(message, status = 400) {
  return json({ error: message }, status);
}

// ---------- /api/tahun-ajaran ----------
async function handleTahunAjaran(env, url) {
  const tahun = url.searchParams.get('tahun') || null;
  const only2025 = tahun === '2025/2026';
  const only2026 = tahun === '2026/2027';

  const taRows = await env.DB.prepare(
    'SELECT id, nama FROM tahun_ajaran ORDER BY tahun_mulai'
  ).all();
  const tahunList = taRows.results;

  const result = [];
  for (const ta of tahunList) {
    if (tahun && ta.nama !== tahun) continue;

    // kelas yg punya enrollment di ta ini
    const kelasRows = await env.DB.prepare(
      `SELECT DISTINCT k.id AS kelas_id, k.nama, k.grade, k.letter, k.program_id
       FROM enrollment e
       JOIN kelas k ON k.id = e.kelas_id
       WHERE e.tahun_ajaran_id = ?
       ORDER BY k.program_id, k.grade, k.letter`
    )
      .bind(ta.id)
      .all();

    for (const k of kelasRows.results) {
      // guru
      const guruRows = await env.DB.prepare(
        `SELECT kg.peran, g.nama AS name, g.telepon AS phone
         FROM kelas_guru kg
         JOIN guru g ON g.id = kg.guru_id
         WHERE kg.kelas_id = ? AND kg.tahun_ajaran_id = ?`
      )
        .bind(k.kelas_id, ta.id)
        .all();

      // santri
      const studentRows = await env.DB.prepare(
        `SELECT s.id AS santri_id, s.nama, s.nama_ayah AS ayah, s.nama_bunda AS bunda,
                s.kode_registrasi, s.tahun_masuk AS academic_year,
                e.status_akademik AS status
         FROM enrollment e
         JOIN santri s ON s.id = e.santri_id
         WHERE e.kelas_id = ? AND e.tahun_ajaran_id = ?
         ORDER BY s.nama`
      )
        .bind(k.kelas_id, ta.id)
        .all();

      const students = [];
      for (const st of studentRows.results) {
        const sibRows = await env.DB.prepare(
          `SELECT nama_teks AS name, kelas_teks AS class, tahun_teks AS academic_year
           FROM saudara WHERE santri_id = ?`
        )
          .bind(st.santri_id)
          .all();
        students.push({
          name: st.nama,
          ayah: st.ayah,
          bunda: st.bunda,
          academic_year: st.academic_year,
          kode_registrasi: st.kode_registrasi,
          siblings: sibRows.results.length ? sibRows.results : null,
          status: st.status,
        });
      }

      result.push({
        name: k.nama,
        teachers: guruRows.results,
        students,
      });
    }
  }

  // beri nama tahun ajaran utk memudahkan front-end
  return json({ tahun_ajaran: tahun ? [tahun] : tahunList.map((t) => t.nama), data: result });
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
