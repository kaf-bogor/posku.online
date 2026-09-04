#!/usr/bin/env node
/**
 * ETL: src/lib/data/*.json -> d1/seed.sql
 *
 * Semantik (disepakati):
 *  - enrollment     : santri berada di kelas pada tahun ajaran FILE (2025/2026, 2026/2027)
 *  - santri.tahun_masuk: tahun pertama santri masuk/daftar (kolom academic_year
 *    di file 2025). Untuk file 2026/2027 yg tidak membawa academic_year,
 *    tahun_masuk DIHITUNG dari jenjang sekarang:
 *        jenjang  KA1=0 KA2=1 KA3=2 Q1=3 Q2=4 Q3=5 Q4=6  (indeks 0 = tahun masuk)
 *        tahun_masuk = tahunMulaiFile - indeksJenjang
 *        contoh: KA2 di 2026/2027 -> 2026-1 = 2025 -> "2025/2026"
 *  - 2026/2027 tidak membawa nama ayah/bunda; sudah di-backfill dari 2025/2026
 *    (dilakukan oleh script terpisah; file JSON sudah diperbarui).
 *  - santri.id_wali: relasi ke wali_santri (keluarga dari data_wali_santri).
 *    Pencocokan bertingkat: nama ayah -> nama ibu -> nama anak santri.
 *  - siblings[]: disimpan teks.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'lib', 'data');
const OUT = path.join(__dirname, 'seed.sql');

const read = (name) => JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8'));
const esc = (v) => (v === null || v === undefined ? 'NULL' : "'" + String(v).replace(/'/g, "''") + "'");
const num = (v) => (v === null || v === undefined || Number.isNaN(Number(v)) ? 'NULL' : String(v));
const low = (v) => (v || '').toLowerCase().trim();
const normName = (v) => low(v).replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();

// ---------------- parsing ----------------
const GRADE_INDEX = {
  'Kuttab Awal:1': 0,
  'Kuttab Awal:2': 1,
  'Kuttab Awal:3': 2,
  'Qonuni:1': 3,
  'Qonuni:2': 4,
  'Qonuni:3': 5,
  'Qonuni:4': 6,
};
function parseKelas(nama) {
  const m = String(nama).match(/^(Kuttab Awal|Qonuni)\s+(\d+)\s*([A-Z]?)$/i);
  if (!m) return { program: null, grade: null, letter: null, index: null };
  const program = m[1] === 'Qonuni' ? 'Qonuni' : 'Kuttab Awal';
  const grade = Number(m[2]);
  return {
    program,
    grade,
    letter: m[3] ? m[3].toUpperCase() : null,
    index: GRADE_INDEX[`${program}:${grade}`] ?? null,
  };
}
function yearStart(nama) {
  const m = String(nama).match(/^(\d{4})\//);
  return m ? Number(m[1]) : null;
}
function fmtTahun(y) {
  return y ? `${y}/${y + 1}` : null;
}

// ---------------- registries ----------------
const kelasById = new Map();
const kelasRows = [];
const guruKeyToId = new Map();
const guruRows = [];
const tahunByName = new Map();
const santriById = new Map();
let idKelas = 0;
let idGuru = 0;
let idTahun = 0;
let idSantri = 0;
const kelasGuruRows = [];
const enrollmentRows = [];
const saudaraRows = [];

function ensureTahun(nama) {
  if (!nama) return null;
  if (!tahunByName.has(nama)) tahunByName.set(nama, ++idTahun);
  return tahunByName.get(nama);
}
function ensureKelas(nama) {
  if (kelasById.has(nama)) return kelasById.get(nama);
  const p = parseKelas(nama);
  const id = ++idKelas;
  kelasById.set(nama, id);
  kelasRows.push({
    id,
    nama,
    program_id: p.program === 'Qonuni' ? 2 : p.program === 'Kuttab Awal' ? 1 : null,
    grade: p.grade,
    letter: p.letter,
  });
  return id;
}
function ensureGuru(nama, telepon) {
  const key = low(nama) + '||' + low(telepon || '');
  if (guruKeyToId.has(key)) return guruKeyToId.get(key);
  const id = ++idGuru;
  guruKeyToId.set(key, id);
  guruRows.push({ id, nama: (nama || '').trim(), telepon: (telepon || '').trim() || null });
  return id;
}
function ensureSantri({ name, ayah, bunda, kode }) {
  const dedupe = kode
    ? 'kode:' + normName(kode)
    : 'n:' + normName(name) + '|a:' + normName(ayah) + '|b:' + normName(bunda);
  if (santriById.has(dedupe)) return santriById.get(dedupe);
  const rec = {
    id: ++idSantri,
    nama: (name || '').trim(),
    ayah: (ayah || '').trim() || null,
    bunda: (bunda || '').trim() || null,
    kode: (kode || '').trim() || null,
    tahun_masuk: null,
    id_wali: null,
    dedupe_key: dedupe,
  };
  santriById.set(dedupe, rec);
  return rec;
}

// ============================================================
// 1) Wali santri (dari data_wali_santri.json) — id dulu
// ============================================================
const waliData = read('data_wali_santri.json');
const waliRows = waliData.map((r, i) => ({
  id: i + 1,
  id_sumber: r.id,
  email: r.email,
  nama_ayah: r.nama_ayah,
  no_hp_ayah: r.no_hp_ayah,
  nama_ibu: r.nama_ibu,
  no_hp_ibu: r.no_hp_ibu,
  alamat: r.alamat_rumah,
  lat: r.lat,
  lon: r.lon,
  pekerjaan_utama_ayah: r.pekerjaan_utama_ayah,
  instansi: r.nama_instansi,
  bidang_pekerjaan_ayah: r.bidang_pekerjaan_ayah,
  peran_di_pekerjaan: r.peran_di_pekerjaan,
  keahlian_ayah: r.keahlian_ayah,
  hobi_minat: r.hobi_minat,
  kategori: r.kategori,
  subkategori: r.subkategori,
  ayah_bersedia_posku: r.ayah_bersedia_posku,
  ayah_bidang_diminati: r.bidang_diminati_ayah,
  ayah_pernah_panitia: r.ayah_pernah_panitia_posku,
  ayah_kegiatan: r.kegiatan_ayah,
  ibu_bersedia_posku: r.ibu_bersedia_posku,
  ibu_bidang_diminati: r.bidang_diminati_ibu,
  ibu_pernah_panitia: r.ibu_pernah_panitia_posku,
  ibu_kegiatan: r.kegiatan_ibu,
  ayah_bersedia_tawaf: r.ayah_bersedia_tawaf,
  kontribusi_tawaf: r.kontribusi_tawaf,
  saran_masukan: r.saran_masukan,
  nama_anak_raw: r.nama_anak,
  kelas_anak_raw: r.kelas_anak,
}));

// index pencocokan santri->wali
const waliByAyah = new Map(); // norm(nama_ayah) -> [waliId]
const waliByIbu = new Map();
const waliByAnak = new Map(); // norm(nama anak) -> [waliId]
for (const w of waliRows) {
  if (w.nama_ayah) {
    const k = normName(w.nama_ayah);
    if (!waliByAyah.has(k)) waliByAyah.set(k, []);
    waliByAyah.get(k).push(w.id);
  }
  if (w.nama_ibu) {
    const k = normName(w.nama_ibu);
    if (!waliByIbu.has(k)) waliByIbu.set(k, []);
    waliByIbu.get(k).push(w.id);
  }
  const kids = (w.nama_anak_raw || '').split(',').map(normName).filter(Boolean);
  for (const kid of kids) {
    if (!waliByAnak.has(kid)) waliByAnak.set(kid, []);
    waliByAnak.get(kid).push(w.id);
  }
}
function resolveWali(rec) {
  // prioritas: ayah -> ibu -> nama anak
  const tryMap = (m, key) => {
    if (!key) return null;
    const arr = m.get(key) || [];
    return arr.length === 1 ? arr[0] : null;
  };
  return (
    tryMap(waliByAyah, normName(rec.ayah)) ||
    tryMap(waliByIbu, normName(rec.bunda)) ||
    tryMap(waliByAnak, normName(rec.nama)) ||
    null
  );
}

// ============================================================
// 2) Santri dari file tahun ajaran
// ============================================================
const TA_FILES = [
  { file: 'tahun_ajaran_2025_2026.json', ta: '2025/2026' },
  { file: 'tahun_ajaran_2026_2027.json', ta: '2026/2027' },
];
let barisSantri = 0;

for (const { file, ta } of TA_FILES) {
  const fileYear = yearStart(ta);
  const taId = ensureTahun(ta);
  const classes = read(file);
  for (const cls of classes) {
    const kelasId = ensureKelas(cls.name);
    const kelasIdx = parseKelas(cls.name).index;
    for (const t of cls.teachers || []) {
      const gid = ensureGuru(t.name, t.phone);
      kelasGuruRows.push({
        kelas_id: kelasId,
        tahun_ajaran_id: taId,
        peran: (t.role || '').trim() || null,
        guru_id: gid,
      });
    }
    for (const s of cls.students || []) {
      barisSantri++;
      const santri = ensureSantri(s);
      // tahun masuk: academic_year bila ada; jika tidak, hitung dari jenjang
      let tahunMasuk = null;
      if (s.academic_year) tahunMasuk = String(s.academic_year).trim();
      else if (fileYear && kelasIdx != null) tahunMasuk = fmtTahun(fileYear - kelasIdx);
      if (tahunMasuk && (!santri.tahun_masuk || tahunMasuk < santri.tahun_masuk)) {
        santri.tahun_masuk = tahunMasuk;
      }
      // isi nama ortu yg masih kosong (mis. 2026 sudah di-backfill sebagian, sisanya null)
      if (!santri.ayah && (s.ayah || '').trim()) santri.ayah = s.ayah.trim();
      if (!santri.bunda && (s.bunda || '').trim()) santri.bunda = s.bunda.trim();
      // relasi ke wali santri
      if (santri.id_wali == null) santri.id_wali = resolveWali(santri);
      enrollmentRows.push({
        santri_id: santri.id,
        kelas_id: kelasId,
        tahun_ajaran_id: taId,
        status: s.status || null,
      });
      for (const sib of s.siblings || []) {
        saudaraRows.push({
          santri_id: santri.id,
          nama_teks: sib.name || null,
          kelas_teks: sib.class || null,
          tahun_teks: sib.academic_year || null,
        });
      }
    }
  }
}

const santriRows = Array.from(santriById.values()).sort((a, b) => a.id - b.id);
const tahunRows = Array.from(tahunByName.entries())
  .map(([nama, id]) => ({ id, nama, tahun_mulai: yearStart(nama) }))
  .sort((a, b) => a.tahun_mulai - b.tahun_mulai);

// ============================================================
// 3) Jembatan wali_anak (nama anak wali -> santri)
// ============================================================
const waliAnakRows = [];
let unmatched = 0;
const splitCsv = (v) => (v || '').split(',').map((x) => x.trim()).filter(Boolean);

for (const w of waliRows) {
  const ayahKey = normName(w.nama_ayah);
  for (const nm of splitCsv(w.nama_anak_raw)) {
    const keyNama = normName(nm);
    if (!keyNama) continue;
    const candidates = santriRows.filter((s) => normName(s.nama) === keyNama);
    let found = null;
    if (candidates.length === 1) found = candidates[0];
    else if (candidates.length > 1)
      found = candidates.find((s) => normName(s.ayah) === ayahKey) || null;
    if (found) {
      if (!waliAnakRows.some((x) => x.wali_id === w.id && x.santri_id === found.id))
        waliAnakRows.push({ wali_id: w.id, santri_id: found.id });
    } else unmatched++;
  }
}

// ============================================================
// 4) Generate SQL
// ============================================================
const lines = [];
lines.push('-- Seed hasil ETL (jangan edit manual)');
lines.push('-- Dibuat: ' + new Date().toISOString());
lines.push('');

const ins = (table, cols, rows) => {
  if (!rows.length) return;
  lines.push(`INSERT INTO ${table} (${cols.join(', ')}) VALUES`);
  rows.forEach((r, i) => {
    const vals = cols.map((c) => (r[c] === null || r[c] === undefined ? null : r[c]));
    const joined = vals
      .map((v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? num(v) : esc(v)))
      .join(', ');
    lines.push(`  (${joined})${i === rows.length - 1 ? ';' : ','}`);
  });
  lines.push('');
};

ins('program', ['kode', 'nama'], [
  { kode: 'KA', nama: 'Kuttab Awal' },
  { kode: 'Q', nama: 'Qonuni' },
]);
ins('kelas', ['id', 'nama', 'program_id', 'grade', 'letter'], kelasRows);
ins('tahun_ajaran', ['id', 'nama', 'tahun_mulai'], tahunRows);
ins('guru', ['id', 'nama', 'telepon'], guruRows);
ins('kelas_guru', ['kelas_id', 'tahun_ajaran_id', 'peran', 'guru_id'], kelasGuruRows);
ins('wali_santri', Object.keys(waliRows[0]), waliRows);
ins(
  'santri',
  ['id', 'nama', 'nama_ayah', 'nama_bunda', 'kode_registrasi', 'tahun_masuk', 'id_wali', 'dedupe_key'],
  santriRows
);
ins('enrollment', ['santri_id', 'kelas_id', 'tahun_ajaran_id', 'status_akademik'], enrollmentRows);
ins('saudara', ['santri_id', 'nama_teks', 'kelas_teks', 'tahun_teks'], saudaraRows);
ins('wali_anak', ['wali_id', 'santri_id'], waliAnakRows);

const now = new Date().toISOString();
ins('sumber_data', ['jenis', 'tahun_ajaran_id', 'nama_file', 'jumlah_baris', 'dimuat_pada'], [
  { jenis: 'data_wali_santri', tahun_ajaran_id: null, nama_file: 'data_wali_santri.json', jumlah_baris: waliRows.length, dimuat_pada: now },
  { jenis: 'tahun_ajaran', tahun_ajaran_id: tahunByName.get('2025/2026'), nama_file: 'tahun_ajaran_2025_2026.json', jumlah_baris: barisSantri, dimuat_pada: now },
  { jenis: 'tahun_ajaran', tahun_ajaran_id: tahunByName.get('2026/2027'), nama_file: 'tahun_ajaran_2026_2027.json', jumlah_baris: barisSantri, dimuat_pada: now },
]);

fs.writeFileSync(OUT, lines.join('\n'));
const withWali = santriRows.filter((s) => s.id_wali != null).length;
console.log('seed.sql ->', OUT);
console.log({
  kelas: kelasRows.length,
  tahun_ajaran: tahunRows.length,
  guru: guruRows.length,
  kelas_guru: kelasGuruRows.length,
  santri: santriRows.length,
  santri_dengan_wali: withWali,
  enrollment: enrollmentRows.length,
  saudara: saudaraRows.length,
  wali_santri: waliRows.length,
  wali_anak: waliAnakRows.length,
  unmatched_anak: unmatched,
});
// contoh cek Muhammad Sulaiman seharusnya sudah 1 record
const cek = santriRows.filter((s) => (s.nama || '').toLowerCase().includes('muhammad sulaiman'));
cek.forEach((s) =>
  console.log('  Muhammad Sulaiman ->', s.id, '| ayah=', s.ayah, '| id_wali=', s.id_wali, '| tahun_masuk=', s.tahun_masuk)
);
