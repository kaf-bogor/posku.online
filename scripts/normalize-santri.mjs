// =============================================================
// Normalisasi file data santri (tahun_ajaran_*.json) SEBELUM ETL ke D1.
//
// Aturan:
//   - Satu identitas santri (nama + nama ayah + nama bunda, ternormalisasi)
//     hanya boleh muncul SEKALI dalam satu tahun ajaran.
//   - Bila muncul di lebih dari satu kelas pada TA yang sama (data rangkap /
//     ghost record), kejadian yang dipertahankan adalah yang pertama muncul
//     di file (urutan kelas = dari jenjang paling muda). Sisanya dihapus.
//   - Tidak menghapus duplikat nama antar tahun ajaran (itu wajar: santri
//     naik kelas). Tidak menghapus dua anak berbeda yang kebetulan senama.
//
// Menulis laporan ke stderr & menimpa file bila ada perubahan.
// Pemakaian: node scripts/normalize-santri.mjs
// =============================================================

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const FILES = [
  ['2025/2026', path.join(root, 'src', 'lib', 'data', 'tahun_ajaran_2025_2026.json')],
  ['2026/2027', path.join(root, 'src', 'lib', 'data', 'tahun_ajaran_2026_2027.json')],
];

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

async function main() {
  let totalRemoved = 0;
  for (const [ta, file] of FILES) {
    const data = JSON.parse(await readFile(file, 'utf8'));
    const seen = new Map(); // identity -> { kelas, rowIdx, studentIdx }
    const removed = [];

    for (const cls of data) {
      const keepIdx = [];
      cls.students.forEach((s, idx) => {
        const key = [norm(s.name), norm(s.ayah), norm(s.bunda)].join('|');
        if (!key || seen.has(key)) {
          if (seen.has(key)) {
            removed.push({
              kelas: cls.name,
              name: s.name,
              ayah: s.ayah,
              bunda: s.bunda,
              duplicate_of_kelas: seen.get(key).kelas,
            });
          }
          return;
        }
        seen.set(key, { kelas: cls.name });
        keepIdx.push(idx);
      });
      if (keepIdx.length !== cls.students.length) {
        cls.students = cls.students.filter((_, i) => keepIdx.includes(i));
      }
    }

    if (removed.length) {
      await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    }
    totalRemoved += removed.length;
    for (const r of removed) {
      console.log(
        `[${ta}] HAPUS duplikat "${r.name}" (ayah=${r.ayah || '-'}, bunda=${r.bunda || '-'}) di ${r.kelas} — sudah ada di ${r.duplicate_of_kelas}`
      );
    }
    const totalSantri = data.reduce((n, c) => n + c.students.length, 0);
    console.log(`[${ta}] kelas=${data.length} santri=${totalSantri} (${removed.length} baris rangkap dihapus)`);
  }
  if (totalRemoved === 0) console.log('Tidak ada baris rangkap; file tidak diubah.');
  else console.log(`Selesai: ${totalRemoved} baris rangkap dihapus.`);
}

main().catch((err) => {
  console.error('Normalisasi gagal:', err);
  process.exit(1);
});
