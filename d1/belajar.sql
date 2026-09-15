-- =============================================================
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
  ('spok-mudah', 'spok', 'mudah', 1, 'spok - mudah', '[{"title":"Subjek itu Pelaku","body":"Subjek adalah PELAKU, yaitu yang melakukan kegiatan. Bayangkan subjek seperti pemain utama dalam cerita.","contoh":["Adik bermain. → Pelaku (subjek): Adik","Ibu memasak. → Pelaku (subjek): Ibu"],"tips":"Tanya: \"Siapa yang melakukan?\" Jawabannya biasanya subjek."},{"title":"Predikat itu Kegiatan","body":"Predikat adalah KEGIATAN yang dilakukan pelaku. Kalau subjek pelakunya, predikat aksinya.","contoh":["Adik bermain. → Kegiatan (predikat): bermain","Burung terbang. → Kegiatan (predikat): terbang"],"tips":"Tanya: \"Sedang melakukan apa?\""},{"title":"Pelaku + Kegiatan","body":"Kalimat paling sederhana punya pelaku (subjek) dan kegiatan (predikat).","contoh":["Ibu memasak.","Ayah membaca.","Burung terbang."],"tips":"Coba buat 3 kalimat pelaku + kegiatan sendiri!"}]', '2026-09-15T13:58:48.785Z'),
  ('spok-sedang', 'spok', 'sedang', 2, 'spok - sedang', '[{"title":"Objek itu Sasaran","body":"Objek adalah SASARAN, yaitu benda yang dikenai kegiatan. Bayangkan objek seperti \"yang jadi sasaran\".","contoh":["Kakak membeli buku. → Sasaran (objek): buku","Ayah mencuci mobil. → Sasaran (objek): mobil"],"tips":"Tanya: \"Apa yang dikenai kegiatan?\""},{"title":"Pelaku + Kegiatan + Sasaran","body":"Menambah objek membuat kalimat lebih jelas: siapa, melakukan apa, pada apa.","contoh":["Ibu memasak nasi.","Adik menyapu lantai."]},{"title":"Latihan menandai SPO","body":"Tentukan pelaku (S), kegiatan (P), dan sasaran (O) pada kalimat berikut.","contoh":["Ayah mencuci mobil.","S: Ayah · P: mencuci · O: mobil"],"tips":"Sasaran biasanya berupa benda."}]', '2026-09-15T13:58:48.785Z'),
  ('spok-sulit', 'spok', 'sulit', 3, 'spok - sulit', '[{"title":"Keterangan itu Info Tambahan","body":"Keterangan memberi info TEMPAT, WAKTU, atau CARA — seperti \"kapan dan di mana kejadiannya\".","contoh":["Ayah mencuci mobil di halaman.","Keterangan tempat: di halaman"]},{"title":"SPOK lengkap","body":"Pelaku + kegiatan + sasaran + info tambahan = kalimat lengkap.","contoh":["Ibu memasak nasi di dapur pada pagi hari."]},{"title":"Info bisa di depan","body":"Keterangan boleh dipindah ke depan tanpa mengubah makna.","contoh":["Pada pagi hari, Ibu memasak nasi di dapur."],"tips":"Bila keterangan di depan, pakai tanda koma."}]', '2026-09-15T13:58:48.785Z'),
  ('penjumlahan-mudah', 'penjumlahan', 'mudah', 1, 'penjumlahan - mudah', '[{"title":"Menjumlah satu angka","body":"Menjumlah berarti menggabungkan dua bilangan.","contoh":["3 + 4 = 7","2 + 5 = 7"]},{"title":"Berhitung dengan jari","body":"Gunakan jari untuk menghitung bilangan kecil.","contoh":["4 + 3 → hitung 4, lanjut 5, 6, 7"]},{"title":"Tukar tempat","body":"Urutan tidak mengubah hasil.","contoh":["3 + 4 = 4 + 3"]}]', '2026-09-15T13:58:48.785Z'),
  ('penjumlahan-sedang', 'penjumlahan', 'sedang', 2, 'penjumlahan - sedang', '[{"title":"Menjumlah puluhan","body":"Jumlahkan satuan dulu, lalu puluhan.","contoh":["23 + 14 → 3+4=7, 20+10=30 → 37"]},{"title":"Menyimpan","body":"Jika satuan lebih dari 9, simpan 1 ke puluhan.","contoh":["27 + 15 → 7+5=12, simpan 1 → 42"]},{"title":"Soal cerita","body":"Ubah cerita menjadi operasi hitung.","contoh":["Ani punya 12 kelereng, diberi 9 → 12 + 9 = 21"]}]', '2026-09-15T13:58:48.785Z'),
  ('penjumlahan-sulit', 'penjumlahan', 'sulit', 3, 'penjumlahan - sulit', '[{"title":"Ratusan","body":"Susun bersusun: satuan, puluhan, ratusan.","contoh":["148 + 76 → 8+6=14 simpan 1 → 224"]},{"title":"Tiga bilangan","body":"Jumlahkan berurutan dari kiri ke kanan.","contoh":["45 + 30 + 25 = 100"]},{"title":"Menaksir","body":"Bulatkan untuk memperkirakan hasil.","contoh":["98 + 41 ≈ 100 + 40 = 140"]}]', '2026-09-15T13:58:48.785Z'),
  ('pengurangan-mudah', 'pengurangan', 'mudah', 1, 'pengurangan - mudah', '[{"title":"Mengurangi bilangan kecil","body":"Mengurangi berarti mengambil sebagian.","contoh":["7 − 3 = 4","9 − 5 = 4"]},{"title":"Hitung mundur","body":"Kurangi dengan menghitung mundur.","contoh":["8 − 2 → 7, 6"]},{"title":"Nol","body":"Mengurangi nol tidak mengubah nilai.","contoh":["6 − 0 = 6"]}]', '2026-09-15T13:58:48.785Z'),
  ('pengurangan-sedang', 'pengurangan', 'sedang', 2, 'pengurangan - sedang', '[{"title":"Pengurangan puluhan","body":"Kurangi satuan, lalu puluhan.","contoh":["48 − 15 → 8−5=3, 40−10=30 → 33"]},{"title":"Meminjam","body":"Jika satuan kurang, pinjam 1 dari puluhan.","contoh":["52 − 17 → 12−7=5, 40−10=30 → 35"]},{"title":"Soal cerita","body":"Tentukan mana yang dikurangi.","contoh":["Budi punya 20 permen, dimakan 6 → 20 − 6 = 14"]}]', '2026-09-15T13:58:48.785Z'),
  ('pengurangan-sulit', 'pengurangan', 'sulit', 3, 'pengurangan - sulit', '[{"title":"Ratusan","body":"Gunakan susun dengan meminjam bila perlu.","contoh":["304 − 128 = 176"]},{"title":"Pengurangan beruntun","body":"Kurangi berurutan dari kiri ke kanan.","contoh":["100 − 25 − 25 = 50"]},{"title":"Selisih","body":"Selisih adalah hasil pengurangan dua bilangan.","contoh":["Selisih 90 dan 65 → 90 − 65 = 25"]}]', '2026-09-15T13:58:48.785Z'),
  ('perkalian-mudah', 'perkalian', 'mudah', 1, 'perkalian - mudah', '[{"title":"Perkalian = penjumlahan berulang","body":"3 × 4 artinya 4 + 4 + 4.","contoh":["3 × 4 = 12","2 × 5 = 10"]},{"title":"Tabel 1–5","body":"Hafalkan perkalian kecil agar cepat.","contoh":["2×3=6","4×4=16","5×5=25"]},{"title":"Kelompok benda","body":"Bayangkan benda dalam beberapa kelompok sama banyak.","contoh":["3 kelompok isi 2 → 3 × 2 = 6"]}]', '2026-09-15T13:58:48.785Z'),
  ('perkalian-sedang', 'perkalian', 'sedang', 2, 'perkalian - sedang', '[{"title":"Tabel 6–9","body":"Latih terus agar hafal.","contoh":["6×7=42","8×9=72"]},{"title":"Perkalian puluhan","body":"Pisahkan puluhan dan satuan.","contoh":["12 × 3 = (10×3)+(2×3) = 30+6 = 36"]},{"title":"Soal cerita","body":"Cari jumlah kelompok × isi tiap kelompok.","contoh":["4 kotak isi 6 pensil → 4 × 6 = 24"]}]', '2026-09-15T13:58:48.785Z'),
  ('perkalian-sulit', 'perkalian', 'sulit', 3, 'perkalian - sulit', '[{"title":"Dua angka × dua angka","body":"Gunakan susun panjang atau distributif.","contoh":["23 × 14 = 23×10 + 23×4 = 230 + 92 = 322"]},{"title":"Sifat distributif","body":"Pecah bilangan agar mudah dihitung.","contoh":["19 × 6 = (20×6) − 6 = 114"]},{"title":"Soal cerita bertingkat","body":"Kerjakan bertahap sesuai cerita.","contoh":["5 dus isi 12 buku, tiap buku 2 lembar → 5×12×2 = 120"]}]', '2026-09-15T13:58:48.785Z'),
  ('pembagian-mudah', 'pembagian', 'mudah', 1, 'pembagian - mudah', '[{"title":"Membagi rata","body":"Pembagian berarti membagi sama banyak.","contoh":["6 ÷ 2 = 3","8 ÷ 4 = 2"]},{"title":"Kebalikan perkalian","body":"Jika 2 × 3 = 6 maka 6 ÷ 2 = 3.","contoh":["3 × 4 = 12 → 12 ÷ 3 = 4"]},{"title":"Bagi dengan 1","body":"Bilangan dibagi 1 hasilnya bilangan itu sendiri.","contoh":["7 ÷ 1 = 7"]}]', '2026-09-15T13:58:48.785Z'),
  ('pembagian-sedang', 'pembagian', 'sedang', 2, 'pembagian - sedang', '[{"title":"Pembagian puluhan","body":"Cari berapa kali pembagi masuk ke bilangan.","contoh":["48 ÷ 4 = 12"]},{"title":"Pembagian bersisa","body":"Sisa selalu lebih kecil dari pembagi.","contoh":["17 ÷ 5 = 3 sisa 2"]},{"title":"Soal cerita","body":"Bagi jumlah ke dalam kelompok sama banyak.","contoh":["24 kue untuk 6 anak → 24 ÷ 6 = 4"]}]', '2026-09-15T13:58:48.785Z'),
  ('pembagian-sulit', 'pembagian', 'sulit', 3, 'pembagian - sulit', '[{"title":"Pembagian bersusun","body":"Bagi dari angka paling depan, turunkan angka berikutnya.","contoh":["96 ÷ 8 = 12"]},{"title":"Pembagian ratusan","body":"Perhatikan sisa di setiap langkah.","contoh":["144 ÷ 12 = 12"]},{"title":"Soal cerita bertingkat","body":"Bagi lalu gunakan hasilnya untuk langkah berikut.","contoh":["120 roti dibagi 8 kotak, tiap kotak 3 baris → 120÷8=15, 15÷3=5"]}]', '2026-09-15T13:58:48.785Z')
ON CONFLICT(id) DO UPDATE SET
  modul = excluded.modul,
  level = excluded.level,
  urutan = excluded.urutan,
  judul = excluded.judul,
  isi = excluded.isi,
  created_at = excluded.created_at;
