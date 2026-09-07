// =============================================================
// Loader dokumen publik untuk RAG "TanyaPOSKU" (worker posku-rag-docs).
//
// Membaca sumber di luar tabel fs_* lalu menyimpannya ke D1 (tabel fs_docs):
//   1. PDF "Modul Kuttab & Madrasah"   -> 1 baris per halaman (kecuali halaman kosong)
//   2. kalender_posku.json             -> 1 baris per event / holiday / program rutin
//
// Konten situs (fs_event, fs_news_item, fs_newsletter, fs_podcasts,
// fs_donation, fs_wakaf_kelas, fs_quiz) TIDAK di-load di sini; dibaca langsung
// oleh worker setiap rebuild agar selalu segar mengikuti perubahan admin.
//
// Cara pakai (dari root repo):
//   node scripts/load-rag-docs.mjs [--apply]
//   env: PDF_PATH (default: ~/Downloads/Modul Kuttab & Madrasah.pdf)
//        KALENDER_PATH (default: src/lib/data/kalender_posku.json)
//   --apply => jalankan langsung `wrangler d1 execute posku-db --remote`
//   tanpa --apply => hanya menulis d1/rag_docs_data.sql
// =============================================================

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { PDFParse } from 'pdf-parse';

const root = fileURLToPath(new URL('..', import.meta.url));
const OUT_SQL = path.join(root, 'd1', 'rag_docs_data.sql');

const PDF_PATH =
  process.env.PDF_PATH ??
  path.join(os.homedir(), 'Downloads', 'Modul Kuttab & Madrasah.pdf');
const KALENDER_PATH =
  process.env.KALENDER_PATH ??
  path.join(root, 'src', 'lib', 'data', 'kalender_posku.json');

const sqlStr = (s) => `'${String(s ?? '').replace(/'/g, "''")}'`;

// ---------- ekstraksi & pembersihan teks ----------
const norm = (t) =>
  String(t ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

async function extractPdf(pdfPath) {
  const buf = await readFile(pdfPath);
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  const pages = Array.isArray(result.pages) ? result.pages : [];
  const docs = [];
  for (const p of pages) {
    const text = norm(p.text);
    if (!text || text.length < 40) continue; // halaman sampul/kosong
    docs.push({
      id: `mod-p${p.num}`,
      source: 'modul',
      kind: 'halaman',
      title: `Halaman ${p.num}`,
      text: `Modul Kuttab & Madrasah — halaman ${p.num}.\n\n${text}`,
      meta: { page: p.num },
    });
  }
  return docs;
}

// ---------- kalender_posku.json ----------
function buildKalender(raw) {
  const docs = [];
  const fmtRange = (ev) => {
    if (!ev.end || ev.end === ev.start) return ev.start;
    return `${ev.start} s/d ${ev.end}`;
  };
  for (const ev of raw.events ?? []) {
    const lines = [`Kegiatan POSKU: ${ev.name}`, `Kategori: ${ev.category}`];
    lines.push(`Waktu: ${fmtRange(ev)}`);
    if (ev.pic) lines.push(`PIC: ${ev.pic}`);
    if (ev.support) lines.push(`Didukung: ${ev.support}`);
    if (ev.committee) lines.push(`Penanggung jawab: ${ev.committee}`);
    if (ev.target) lines.push(`Target peserta: ${ev.target}`);
    if (ev.desc) lines.push(`Deskripsi: ${ev.desc}`);
    docs.push({
      id: `kal-event-${ev.start}-${slugify(ev.name)}`,
      source: 'kalender',
      kind: 'event',
      title: ev.name,
      text: lines.join('\n'),
      meta: { category: ev.category, start: ev.start, end: ev.end },
    });
  }
  for (const h of raw.holidays ?? []) {
    const lines = [`Hari libur / tanggal penting: ${h.name}`, `Tanggal: ${h.start}`];
    if (h.note) lines.push(`Catatan: ${h.note}`);
    docs.push({
      id: `kal-libur-${h.start}-${slugify(h.name)}`,
      source: 'kalender',
      kind: 'holiday',
      title: h.name,
      text: lines.join('\n'),
      meta: { start: h.start, note: h.note },
    });
  }
  for (const o of raw.ongoing_programs ?? []) {
    const lines = [
      `Program rutin POSKU: ${o.name}`,
      `Frekuensi: ${o.cadence}`,
    ];
    if (o.desc) lines.push(`Deskripsi: ${o.desc}`);
    if (o.pic) lines.push(`PIC: ${o.pic}`);
    docs.push({
      id: `kal-rutin-${slugify(o.name)}`,
      source: 'kalender',
      kind: 'ongoing',
      title: o.name,
      text: lines.join('\n'),
      meta: {},
    });
  }
  if (raw.title || raw.subtitle || raw.range) {
    docs.push({
      id: 'kal-info',
      source: 'kalender',
      kind: 'info',
      title: 'Kalender POSKU (info umum)',
      text: [
        raw.title ? `Kalender: ${raw.title}` : null,
        raw.subtitle ? `Sub judul: ${raw.subtitle}` : null,
        raw.range ? `Periode: ${raw.range}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
      meta: { range: raw.range },
    });
  }
  return docs;
}

function slugify(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// ---------- generator SQL ----------
function buildSql(docs) {
  const lines = [];
  lines.push('-- ============================================================');
  lines.push('-- Dibuat oleh scripts/load-rag-docs.mjs (jangan diedit manual)');
  lines.push('-- Isi ulang tabel fs_docs untuk RAG publik POSKU.');
  lines.push('-- ============================================================');
  lines.push('');
  lines.push('CREATE TABLE IF NOT EXISTS fs_docs (');
  lines.push('  id         TEXT PRIMARY KEY,');
  lines.push('  source     TEXT NOT NULL,');
  lines.push('  kind       TEXT,');
  lines.push('  title      TEXT,');
  lines.push('  text       TEXT NOT NULL,');
  lines.push('  meta       TEXT,');
  lines.push('  updated_at TEXT');
  lines.push(');');
  lines.push('');
  lines.push('CREATE TABLE IF NOT EXISTS fs_rag_state (');
  lines.push('  id         TEXT PRIMARY KEY,');
  lines.push('  vector_ids TEXT,');
  lines.push('  indexed_at TEXT');
  lines.push(');');
  lines.push('');
  lines.push("DELETE FROM fs_docs WHERE source IN ('modul', 'kalender');");
  lines.push('');
  const now = new Date().toISOString();
  const rows = [];
  for (const d of docs) {
    const meta = JSON.stringify(d.meta ?? {});
    rows.push(
      `(${sqlStr(d.id)}, ${sqlStr(d.source)}, ${sqlStr(d.kind)}, ${sqlStr(
        d.title
      )}, ${sqlStr(d.text)}, ${sqlStr(meta)}, ${sqlStr(now)})`
    );
  }
  for (let i = 0; i < rows.length; i += 25) {
    const chunk = rows.slice(i, i + 25);
    lines.push('INSERT INTO fs_docs (id, source, kind, title, text, meta, updated_at) VALUES');
    lines.push(chunk.join(',\n') + ';');
    lines.push('');
  }
  return lines.join('\n');
}

// ---------- main ----------
async function main() {
  const apply = process.argv.includes('--apply');

  console.log(`PDF     : ${PDF_PATH}`);
  console.log(`Kalender: ${KALENDER_PATH}`);

  const pdfDocs = await extractPdf(PDF_PATH);
  console.log(`PDF -> ${pdfDocs.length} halaman (dgn teks).`);

  const rawKal = JSON.parse(await readFile(KALENDER_PATH, 'utf8'));
  const kalDocs = buildKalender(rawKal);
  console.log(`Kalender -> ${kalDocs.length} item.`);

  const docs = [...pdfDocs, ...kalDocs];
  const sql = buildSql(docs);

  await mkdir(path.dirname(OUT_SQL), { recursive: true });
  await writeFile(OUT_SQL, sql, 'utf8');
  console.log(`SQL ditulis ke ${OUT_SQL} (${docs.length} baris).`);

  if (apply) {
    console.log('\nMenjalankan ke D1 remote (posku-db) ...');
    const res = spawnSync(
      'npx',
      ['wrangler', 'd1', 'execute', 'posku-db', '--remote', '--file', OUT_SQL],
      { cwd: root, stdio: 'inherit' }
    );
    if (res.status !== 0) {
      console.error('Gagal menerapkan SQL ke D1.');
      process.exit(res.status ?? 1);
    }
    console.log('Selesai: fs_docs terisi.');
  } else {
    console.log('\nLewati apply (tanpa --apply). Jalankan ulang dgn --apply utk upload ke D1.');
  }
}

main().catch((err) => {
  console.error('Loader gagal:', err);
  process.exit(1);
});
