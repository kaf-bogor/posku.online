// =============================================================
// Generate d1/pengurus.sql dari daftar pengurus POSKU.
// - email dinormalisasi (lowercase, typo @gmai.com -> @gmail.com)
// - email kosong / tidak valid dilewati (tidak didaftarkan)
// - idempoten: UPSERT by email
//
// Pemakaian: node scripts/seed-pengurus.mjs
//   lalu: npx wrangler d1 execute posku-db --remote --file=d1/pengurus.sql
// =============================================================

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

// [email, nama, divisi]
const ROWS = [
  ['samudbr@gmail.com', 'Bimo Rekso Samudro', 'Ketua Posku'],
  ['trestyani0729@gmail.com', 'Tia Restyani', 'Ketua Posku'],
  ['apandi16@gmail.com', 'Rifki Apandi', 'Sekretaris'],
  ['nnurlela16@gmail.com', 'Nurlela', 'Sekretaris'],
  ['jupri.supriadi@gmail.com', 'Jupri Supriadi', 'Sekretaris'],
  ['shivaulya208@gmail.com', 'Shiva Ulya Azizah', 'Sekretaris'],
  ['girindra.wardhana.2013@gmail.com', 'Girindra Wardhana', 'Bendahara'],
  ['widyafitriyanti31@gmail.com', 'Widya Fitriyanti', 'Bendahara'],
  ['yerrie76@gmail.com', 'Ronny Yerrie', 'Bendahara'],
  ['sastiambar@gmail.com', 'Sasti Ambarwati Nursani', 'Bendahara'],
  ['sureukis.283@gmail.com', 'Muhlis Prasetyo', 'Media'],
  ['nurlikacahyani@gmail.com', 'Nurlika Cahyani', 'Media'],
  ['kubido@gmail.com', 'Rifki Fauzi', 'Media'],
  ['eq.ardhana@gmail.com', 'Mas Ecky Adhana', 'Media'],
  ['intan.dwita@gmail.com', 'Intan Dwita Kemala', 'Media'],
  ['fphasry@gmail.com', 'Febriandy P H', 'Tarbiyah - KBO'],
  ['prasetya.kreatif@gmail.com', 'R. Prasetya Darma Putranto', 'Tarbiyah - KBO'],
  ['msolehudin.mm@gmail.com', 'Muhamad Solehudin', 'Tarbiyah - KBO'],
  // Ashgaf Abdillah — email kosong (tidak didaftarkan)
  ['dd.ahmad.m.hd@gmail.com', 'Dede Ahmad Mukhtarom', 'Tarbiyah - Kajian Qowamah'],
  ['yanissawiti12@gmail.com', 'Muhammad Yanis Sawiti', 'Tarbiyah - Kajian Qowamah'],
  ['achmadsyaefillah309@gmail.com', 'Achmad Syaefillah', 'Tarbiyah - Tahsin'],
  ['adamlubis13@gmail.com', 'Adam Malik Lubis', 'Tarbiyah - Tahsin'],
  ['dika290184@gmail.com', 'Helman Wijaya', 'Tarbiyah - Sentra Literasi'],
  ['jundullah0709@gmail.com', 'Agus Setiawan', 'Tarbiyah - Sentra Literasi'],
  ['septian.shum@gmai.com', 'Septian AW', 'Tarbiyah - Sentra Literasi'], // typo gmai.com
  // Bayu Rustami — email kosong (tidak didaftarkan)
  ['wanyoga@yahoo.com', 'Wan Yoga', 'Ukhuwah - Sentra Sehat dan Bugar'],
  ['muhammad.hc.lucky@gmail.com', 'Muhammad Ridwan', 'Ukhuwah - Sentra Sehat dan Bugar'],
  ['karjito33@gmail.com', 'Karjito', 'Ukhuwah - Sentra Sehat dan Bugar'],
  ['Suhardiman1977@gmail.com', 'Suhardiman', 'Ukhuwah - Sentra Sosial dan Kreatif'],
  ['sopian.lucky@gmail.com', 'Ahmad Sopian', 'Ukhuwah - Sentra Sosial dan Kreatif'],
  ['rantifutiawati@gmail.com', 'Ranti Futiawati', 'Tarbiyah - Kajian Ummahat'],
  [
    'lindasoleh12@gmail.com',
    'Linda Puspita Sari',
    'Tarbiyah - Sentra Literasi/Tarbiyah - Kajian Ummahat',
  ],
  ['bukupintu20@gmail.com', 'Yopi Rahayu', 'Tarbiyah - Sentra Literasi'],
  // Irma Afni — email kosong (tidak didaftarkan)
  ['ahmadbman@gmail.com', 'Novi Pratiwi', 'Tarbiyah - Kajian Ummahat'],
  ['ghia.radhita@yahoo.com', 'Ghia Astri Raditha', 'Tarbiyah - Tahsin Ummahat'],
  ['nda.mars@gmail.com', 'Linda Kurnia', 'Tarbiyah - Tahsin Ummahat'],
  ['destriyantisuwandi@gmail.com', 'Destriyanti', 'Tarbiyah - Tahsin Ummahat'],
  [
    'noor.baiti28@gmail.com',
    'Noor Baiti',
    'Tarbiyah - Tahsin Ummahat/ Ukhuwah - Sentra Sehat',
  ],
  ['umiyasmin@gmail.com', 'Evi Yusmiawati', 'Tarbiyah - Tahsin Ummahat'],
  ['tiani.nov@gmail.com', 'Tiani Novyanti', 'Ukhuwah - Sentra Sehat'],
  ['reti.cute@gmail.com', 'Tri Reti Rahmawati', 'Ukhuwah - Sentra Bugar'],
  [
    'yuyunnovia1211@gmail.com',
    'Yuyun Novia',
    'Ukhuwah - Sentra Bugar/ Tarbiyah - Kajian Ummahat',
  ],
  // Lela Mela Sari — email kosong (tidak didaftarkan)
  ['pujirahayu4785@gmail.com', 'Puji Rahayu', 'Ukhuwah - Sentra Kreatif'],
  // Ratna Marhendri Kusumawati — email kosong (tidak didaftarkan)
];

const norm = (e) =>
  String(e || '')
    .trim()
    .toLowerCase()
    .replace(/@gmai\.com$/, '@gmail.com')
    .replace(/\s+/g, ' ');

const sqlStr = (s) => `'${String(s ?? '').replace(/'/g, "''")}'`;

const seen = new Set();
const values = [];
for (const [email, nama, divisi] of ROWS) {
  const e = norm(email);
  if (!e || !e.includes('@')) continue;
  if (seen.has(e)) continue;
  seen.add(e);
  values.push(
    `  (${sqlStr(e)}, ${sqlStr(nama)}, ${sqlStr(divisi)}, ${sqlStr('pengurus')}, ${sqlStr(new Date().toISOString())})`
  );
}

const sql = `-- =============================================================
-- Data pengurus POSKU (role khusus utk akses data santri/wali santri).
-- Dibuat oleh scripts/seed-pengurus.mjs (jangan edit manual).
-- Idempoten: aman dijalankan ulang (UPSERT by email).
-- Jalankan: npx wrangler d1 execute posku-db --remote --file=d1/pengurus.sql
-- =============================================================

CREATE TABLE IF NOT EXISTS pengurus (
  email        TEXT PRIMARY KEY,
  nama         TEXT,
  divisi       TEXT,
  role         TEXT NOT NULL DEFAULT 'pengurus',
  google_sub   TEXT,
  display_name TEXT,
  last_login   TEXT,
  created_at   TEXT
);

INSERT INTO pengurus (email, nama, divisi, role, created_at) VALUES
${values.join(',\n')}
ON CONFLICT(email) DO UPDATE SET
  nama = excluded.nama,
  divisi = excluded.divisi,
  role = excluded.role;
`;

const out = path.join(root, 'd1', 'pengurus.sql');
writeFileSync(out, sql, 'utf8');
console.log(`d1/pengurus.sql -> ${values.length} pengurus`);
