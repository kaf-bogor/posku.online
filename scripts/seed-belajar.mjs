// =============================================================
// Generate d1/belajar.sql: tabel materi belajar + seed materi.
// Soal TIDAK disimpan di sini (digenerate AI saat runtime, lalu di-cache).
//
// Pemakaian: node scripts/seed-belajar.mjs
//   lalu: npx wrangler d1 execute posku-db --remote --file=d1/belajar.sql
// =============================================================

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const LEVELS = ['mudah', 'sedang', 'sulit'];

// steps: { title, body, contoh?: string[], tips?: string }
const MODULES = [
  {
    modul: 'spok',
    levels: {
      mudah: [
        {
          title: 'Subjek itu Pelaku',
          body: 'Subjek adalah PELAKU, yaitu yang melakukan kegiatan. Bayangkan subjek seperti pemain utama dalam cerita.',
          contoh: ['Adik bermain. → Pelaku (subjek): Adik', 'Ibu memasak. → Pelaku (subjek): Ibu'],
          tips: 'Tanya: "Siapa yang melakukan?" Jawabannya biasanya subjek.',
        },
        {
          title: 'Predikat itu Kegiatan',
          body: 'Predikat adalah KEGIATAN yang dilakukan pelaku. Kalau subjek pelakunya, predikat aksinya.',
          contoh: ['Adik bermain. → Kegiatan (predikat): bermain', 'Burung terbang. → Kegiatan (predikat): terbang'],
          tips: 'Tanya: "Sedang melakukan apa?"',
        },
        {
          title: 'Pelaku + Kegiatan',
          body: 'Kalimat paling sederhana punya pelaku (subjek) dan kegiatan (predikat).',
          contoh: ['Ibu memasak.', 'Ayah membaca.', 'Burung terbang.'],
          tips: 'Coba buat 3 kalimat pelaku + kegiatan sendiri!',
        },
      ],
      sedang: [
        {
          title: 'Objek itu Sasaran',
          body: 'Objek adalah SASARAN, yaitu benda yang dikenai kegiatan. Bayangkan objek seperti "yang jadi sasaran".',
          contoh: ['Kakak membeli buku. → Sasaran (objek): buku', 'Ayah mencuci mobil. → Sasaran (objek): mobil'],
          tips: 'Tanya: "Apa yang dikenai kegiatan?"',
        },
        {
          title: 'Pelaku + Kegiatan + Sasaran',
          body: 'Menambah objek membuat kalimat lebih jelas: siapa, melakukan apa, pada apa.',
          contoh: ['Ibu memasak nasi.', 'Adik menyapu lantai.'],
        },
        {
          title: 'Latihan menandai SPO',
          body: 'Tentukan pelaku (S), kegiatan (P), dan sasaran (O) pada kalimat berikut.',
          contoh: ['Ayah mencuci mobil.', 'S: Ayah · P: mencuci · O: mobil'],
          tips: 'Sasaran biasanya berupa benda.',
        },
      ],
      sulit: [
        {
          title: 'Keterangan itu Info Tambahan',
          body: 'Keterangan memberi info TEMPAT, WAKTU, atau CARA — seperti "kapan dan di mana kejadiannya".',
          contoh: ['Ayah mencuci mobil di halaman.', 'Keterangan tempat: di halaman'],
        },
        {
          title: 'SPOK lengkap',
          body: 'Pelaku + kegiatan + sasaran + info tambahan = kalimat lengkap.',
          contoh: ['Ibu memasak nasi di dapur pada pagi hari.'],
        },
        {
          title: 'Info bisa di depan',
          body: 'Keterangan boleh dipindah ke depan tanpa mengubah makna.',
          contoh: ['Pada pagi hari, Ibu memasak nasi di dapur.'],
          tips: 'Bila keterangan di depan, pakai tanda koma.',
        },
      ],
    },
  },
  {
    modul: 'penjumlahan',
    levels: {
      mudah: [
        {
          title: 'Menjumlah satu angka',
          body: 'Menjumlah berarti menggabungkan dua bilangan.',
          contoh: ['3 + 4 = 7', '2 + 5 = 7'],
        },
        {
          title: 'Berhitung dengan jari',
          body: 'Gunakan jari untuk menghitung bilangan kecil.',
          contoh: ['4 + 3 → hitung 4, lanjut 5, 6, 7'],
        },
        {
          title: 'Tukar tempat',
          body: 'Urutan tidak mengubah hasil.',
          contoh: ['3 + 4 = 4 + 3'],
        },
      ],
      sedang: [
        {
          title: 'Menjumlah puluhan',
          body: 'Jumlahkan satuan dulu, lalu puluhan.',
          contoh: ['23 + 14 → 3+4=7, 20+10=30 → 37'],
        },
        {
          title: 'Menyimpan',
          body: 'Jika satuan lebih dari 9, simpan 1 ke puluhan.',
          contoh: ['27 + 15 → 7+5=12, simpan 1 → 42'],
        },
        {
          title: 'Soal cerita',
          body: 'Ubah cerita menjadi operasi hitung.',
          contoh: ['Ani punya 12 kelereng, diberi 9 → 12 + 9 = 21'],
        },
      ],
      sulit: [
        {
          title: 'Ratusan',
          body: 'Susun bersusun: satuan, puluhan, ratusan.',
          contoh: ['148 + 76 → 8+6=14 simpan 1 → 224'],
        },
        {
          title: 'Tiga bilangan',
          body: 'Jumlahkan berurutan dari kiri ke kanan.',
          contoh: ['45 + 30 + 25 = 100'],
        },
        {
          title: 'Menaksir',
          body: 'Bulatkan untuk memperkirakan hasil.',
          contoh: ['98 + 41 ≈ 100 + 40 = 140'],
        },
      ],
    },
  },
  {
    modul: 'pengurangan',
    levels: {
      mudah: [
        {
          title: 'Mengurangi bilangan kecil',
          body: 'Mengurangi berarti mengambil sebagian.',
          contoh: ['7 − 3 = 4', '9 − 5 = 4'],
        },
        {
          title: 'Hitung mundur',
          body: 'Kurangi dengan menghitung mundur.',
          contoh: ['8 − 2 → 7, 6'],
        },
        {
          title: 'Nol',
          body: 'Mengurangi nol tidak mengubah nilai.',
          contoh: ['6 − 0 = 6'],
        },
      ],
      sedang: [
        {
          title: 'Pengurangan puluhan',
          body: 'Kurangi satuan, lalu puluhan.',
          contoh: ['48 − 15 → 8−5=3, 40−10=30 → 33'],
        },
        {
          title: 'Meminjam',
          body: 'Jika satuan kurang, pinjam 1 dari puluhan.',
          contoh: ['52 − 17 → 12−7=5, 40−10=30 → 35'],
        },
        {
          title: 'Soal cerita',
          body: 'Tentukan mana yang dikurangi.',
          contoh: ['Budi punya 20 permen, dimakan 6 → 20 − 6 = 14'],
        },
      ],
      sulit: [
        {
          title: 'Ratusan',
          body: 'Gunakan susun dengan meminjam bila perlu.',
          contoh: ['304 − 128 = 176'],
        },
        {
          title: 'Pengurangan beruntun',
          body: 'Kurangi berurutan dari kiri ke kanan.',
          contoh: ['100 − 25 − 25 = 50'],
        },
        {
          title: 'Selisih',
          body: 'Selisih adalah hasil pengurangan dua bilangan.',
          contoh: ['Selisih 90 dan 65 → 90 − 65 = 25'],
        },
      ],
    },
  },
  {
    modul: 'perkalian',
    levels: {
      mudah: [
        {
          title: 'Kali = Tambah Berulang',
          body: '3 × 2 artinya 2 + 2 + 2. Perkalian adalah penjumlahan kelompok yang sama banyak.',
          contoh: ['3 × 2 = 2 + 2 + 2 = 6', '5 × 3 = 3 + 3 + 3 + 3 + 3 = 15'],
          tips: 'Kali itu seperti menambah kelompok yang sama banyak.',
        },
        {
          title: 'Berhitung Loncat 2, 5, 10',
          body: 'Hitung loncat membantu menghafal tabel 2, 5, dan 10.',
          contoh: ['2, 4, 6, 8, 10', '5, 10, 15, 20', '10, 20, 30, 40'],
        },
        {
          title: 'Tabel 2, 5, 10',
          body: 'Hafalkan fakta tabel 2, 5, dan 10 agar cepat.',
          contoh: ['2 × 4 = 8', '5 × 3 = 15', '10 × 6 = 60'],
          tips: 'Gunakan benda (telur, kaus kaki) untuk melihat kelompoknya.',
        },
      ],
      sedang: [
        {
          title: 'Tabel 3, 4, 8 (sampai 12)',
          body: 'Hafalkan tabel 3, 4, 8, dan lanjut sampai 12 × 12.',
          contoh: ['3 × 6 = 18', '4 × 7 = 28', '8 × 5 = 40'],
        },
        {
          title: 'Kali 2 Angka × 1 Angka',
          body: 'Pecah jadi puluhan dan satuan, lalu jumlahkan.',
          contoh: ['23 × 4 = (20×4) + (3×4) = 80 + 12 = 92'],
        },
        {
          title: 'Kebalikan Kali & Bagi',
          body: 'Kali dan bagi saling membatalkan, gunakan untuk memeriksa jawaban.',
          contoh: ['4 × 6 = 24 → 24 ÷ 4 = 6'],
          tips: 'Estimasi dulu, lalu periksa dengan cara lain.',
        },
      ],
      sulit: [
        {
          title: 'Kali Susun Panjang',
          body: 'Kalikan 2 angka × 2 angka bertahap: puluhan dulu, lalu satuan.',
          contoh: ['24 × 13 = 24×10 + 24×3 = 240 + 72 = 312'],
        },
        {
          title: 'Kali 3–4 Angka × 1 Angka',
          body: 'Gunakan susun bersusun dan simpan bila perlu.',
          contoh: ['132 × 4 = 528', '1.204 × 3 = 3.612'],
        },
        {
          title: 'Soal Cerita Bertingkat',
          body: 'Kerjakan bertahap sesuai cerita.',
          contoh: ['5 dus isi 12 buku, tiap buku 2 lembar → 5×12×2 = 120'],
          tips: 'Tulis langkah 1, langkah 2, lalu jawabannya.',
        },
      ],
    },
  },
  {
    modul: 'pembagian',
    levels: {
      mudah: [
        {
          title: 'Bagi = Membagi Rata',
          body: '6 ÷ 2 artinya 6 dibagi rata ke 2 kelompok. Setiap kelompok sama banyak.',
          contoh: ['6 ÷ 2 = 3', '10 ÷ 5 = 2'],
          tips: 'Bayangkan membagi permen ke beberapa teman.',
        },
        {
          title: 'Kelompok & Berbagi',
          body: 'Susun benda ke beberapa kelompok sama banyak, lalu hitung isi tiap kelompok.',
          contoh: ['8 kelereng ke 4 anak → tiap anak 2', '12 bunga ke 3 pot → tiap pot 4'],
        },
        {
          title: 'Tabel 2, 5, 10',
          body: 'Pembagian berhubungan dengan tabel 2, 5, dan 10.',
          contoh: ['10 ÷ 2 = 5', '20 ÷ 5 = 4', '30 ÷ 10 = 3'],
        },
      ],
      sedang: [
        {
          title: 'Kebalikan Perkalian',
          body: 'Cari hasil bagi dengan mengingat perkaliannya.',
          contoh: ['24 ÷ 4 = 6 karena 4 × 6 = 24'],
        },
        {
          title: 'Bagi 2 Angka ÷ 1 Angka',
          body: 'Gunakan tabel atau susun sederhana.',
          contoh: ['48 ÷ 4 = 12', '96 ÷ 8 = 12'],
        },
        {
          title: 'Pembagian Bersisa',
          body: 'Kadang ada sisa. Sisa selalu lebih kecil dari pembagi.',
          contoh: ['17 ÷ 5 = 3 sisa 2'],
          tips: 'Periksa: pembagi × hasil + sisa = bilangan awal.',
        },
      ],
      sulit: [
        {
          title: 'Pembagian Bersusun',
          body: 'Bagi dari angka paling depan, lalu turunkan angka berikutnya.',
          contoh: ['96 ÷ 8 = 12', '144 ÷ 12 = 12'],
        },
        {
          title: 'Bagi 3–4 Angka ÷ 1–2 Angka',
          body: 'Gunakan pembagian bersusun, catat sisa di setiap langkah.',
          contoh: ['1.248 ÷ 12 = 104', '4.536 ÷ 9 = 504'],
        },
        {
          title: 'Soal Cerita Bertingkat',
          body: 'Bagi dulu, lalu gunakan hasilnya untuk langkah berikut.',
          contoh: ['120 roti dibagi 8 kotak, tiap kotak 3 baris → 120÷8=15, 15÷3=5'],
        },
      ],
    },
  },
];

const sqlStr = (s) => `'${String(s ?? '').replace(/'/g, "''")}'`;

const rows = [];
const now = new Date().toISOString();
for (const m of MODULES) {
  LEVELS.forEach((level, idx) => {
    const steps = m.levels[level];
    if (!steps || steps.length === 0) return;
    const id = `${m.modul}-${level}`;
    const judul = `${m.modul} - ${level}`;
    rows.push(
      `  (${sqlStr(id)}, ${sqlStr(m.modul)}, ${sqlStr(level)}, ${idx + 1}, ${sqlStr(
        judul
      )}, ${sqlStr(JSON.stringify(steps))}, ${sqlStr(now)})`
    );
  });
}

const sql = `-- =============================================================
-- Modul belajar anak: tabel materi + cache soal (AI).
-- Dibuat oleh scripts/seed-belajar.mjs (jangan edit manual).
-- Idempoten: aman dijalankan ulang (UPSERT by id).
-- Jalankan: npx wrangler d1 execute posku-db --remote --file=d1/belajar.sql
-- =============================================================

CREATE TABLE IF NOT EXISTS belajar_materi (
  id         TEXT PRIMARY KEY,
  modul      TEXT NOT NULL,
  level      TEXT NOT NULL,
  urutan     INTEGER NOT NULL,
  judul      TEXT NOT NULL,
  isi        TEXT NOT NULL,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_belajar_materi
  ON belajar_materi (modul, level, urutan);

CREATE TABLE IF NOT EXISTS belajar_soal_cache (
  cache_key  TEXT PRIMARY KEY,
  payload    TEXT NOT NULL,
  created_at TEXT
);

INSERT INTO belajar_materi (id, modul, level, urutan, judul, isi, created_at) VALUES
${rows.join(',\n')}
ON CONFLICT(id) DO UPDATE SET
  modul = excluded.modul,
  level = excluded.level,
  urutan = excluded.urutan,
  judul = excluded.judul,
  isi = excluded.isi,
  created_at = excluded.created_at;
`;

writeFileSync(path.join(root, 'd1', 'belajar.sql'), sql, 'utf8');
console.log(`d1/belajar.sql -> ${rows.length} materi`);
