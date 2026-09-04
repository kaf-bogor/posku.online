-- =============================================================
-- POSKU Data Santri + Wali Santri  ->  Cloudflare D1
-- Schema migration (idempotent-ish: run on an empty/fresh D1 DB)
-- =============================================================

PRAGMA foreign_keys = ON;

-- ---------- Referensi kelas & tahun ajaran ----------
CREATE TABLE IF NOT EXISTS program (
  id      INTEGER PRIMARY KEY,
  kode    TEXT NOT NULL,
  nama    TEXT NOT NULL UNIQUE
);

-- contoh: "Kuttab Awal 1A" -> program "Kuttab Awal", grade 1, letter "A"
CREATE TABLE IF NOT EXISTS kelas (
  id         INTEGER PRIMARY KEY,
  nama       TEXT NOT NULL UNIQUE,   -- nama lengkap seperti di JSON
  program_id INTEGER REFERENCES program(id),
  grade      INTEGER,                -- 1..4 (parsed)
  letter     TEXT                    -- "A".."D", boleh NULL (e.g. "Qonuni 1")
);

CREATE TABLE IF NOT EXISTS tahun_ajaran (
  id           INTEGER PRIMARY KEY,
  nama         TEXT NOT NULL UNIQUE, -- "2025/2026"
  tahun_mulai  INTEGER               -- 2025
);

-- ---------- Guru ----------
CREATE TABLE IF NOT EXISTS guru (
  id       INTEGER PRIMARY KEY,
  nama     TEXT NOT NULL,
  telepon  TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_guru_nama_telp
  ON guru (LOWER(nama), LOWER(COALESCE(telepon, '')));

CREATE TABLE IF NOT EXISTS kelas_guru (
  id              INTEGER PRIMARY KEY,
  kelas_id        INTEGER NOT NULL REFERENCES kelas(id),
  tahun_ajaran_id INTEGER NOT NULL REFERENCES tahun_ajaran(id),
  peran           TEXT,               -- "Guru Iman", "Guru Qur'an", "Guru Iman & Qur'an"
  guru_id         INTEGER NOT NULL REFERENCES guru(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_kelas_guru
  ON kelas_guru (kelas_id, tahun_ajaran_id, peran, guru_id);

-- ---------- Santri ----------
CREATE TABLE IF NOT EXISTS santri (
  id               INTEGER PRIMARY KEY,
  nama             TEXT NOT NULL,
  nama_ayah        TEXT,
  nama_bunda       TEXT,
  kode_registrasi  TEXT,
  tahun_masuk      TEXT,            -- "2024/2025" (tahun pertama masuk / daftar)
  id_wali          INTEGER REFERENCES wali_santri(id),  -- terhubung ke keluarga (data_wali_santri)
  -- normalisasi nama+ortu utk dedupe antar tahun ajaran
  dedupe_key       TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS enrollment (
  id              INTEGER PRIMARY KEY,
  santri_id       INTEGER NOT NULL REFERENCES santri(id),
  kelas_id        INTEGER NOT NULL REFERENCES kelas(id),
  tahun_ajaran_id INTEGER NOT NULL REFERENCES tahun_ajaran(id),
  status_akademik TEXT                  -- naik_kelas | lulus | pindah | NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_enrollment
  ON enrollment (santri_id, kelas_id, tahun_ajaran_id);

-- saudara dari field siblings[] (disimpan polos, belum resolve id)
CREATE TABLE IF NOT EXISTS saudara (
  id          INTEGER PRIMARY KEY,
  santri_id   INTEGER NOT NULL REFERENCES santri(id),
  nama_teks   TEXT,
  kelas_teks  TEXT,
  tahun_teks  TEXT
);

-- ---------- Wali santri (survei potensi, per keluarga) ----------
CREATE TABLE IF NOT EXISTS wali_santri (
  id                      INTEGER PRIMARY KEY,
  id_sumber               INTEGER,   -- id asli di JSON
  email                   TEXT,
  nama_ayah               TEXT,
  no_hp_ayah              TEXT,
  nama_ibu                TEXT,
  no_hp_ibu               TEXT,
  alamat                  TEXT,
  lat                     REAL,
  lon                     REAL,
  pekerjaan_utama_ayah    TEXT,
  instansi                TEXT,
  bidang_pekerjaan_ayah   TEXT,
  peran_di_pekerjaan      TEXT,
  keahlian_ayah           TEXT,
  hobi_minat              TEXT,
  kategori                TEXT,
  subkategori             TEXT,
  ayah_bersedia_posku     TEXT,
  ayah_bidang_diminati    TEXT,
  ayah_pernah_panitia     TEXT,
  ayah_kegiatan           TEXT,
  ibu_bersedia_posku      TEXT,
  ibu_bidang_diminati     TEXT,
  ibu_pernah_panitia      TEXT,
  ibu_kegiatan            TEXT,
  ayah_bersedia_tawaf     TEXT,
  kontribusi_tawaf        TEXT,
  saran_masukan           TEXT,
  -- teks mentah anak (dari form) agar tidak hilang; resolusi via wali_anak
  nama_anak_raw           TEXT,
  kelas_anak_raw          TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_wali_sumber
  ON wali_santri (id_sumber);

-- ---------- Tabel jembatan wali <-> santri ----------
CREATE TABLE IF NOT EXISTS wali_anak (
  id         INTEGER PRIMARY KEY,
  wali_id    INTEGER NOT NULL REFERENCES wali_santri(id),
  santri_id  INTEGER NOT NULL REFERENCES santri(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_wali_anak
  ON wali_anak (wali_id, santri_id);

-- ---------- Audit / source ----------
CREATE TABLE IF NOT EXISTS sumber_data (
  id              INTEGER PRIMARY KEY,
  jenis           TEXT NOT NULL,      -- 'data_wali_santri' | 'tahun_ajaran'
  tahun_ajaran_id INTEGER REFERENCES tahun_ajaran(id),
  nama_file       TEXT,
  jumlah_baris    INTEGER,
  dimuat_pada     TEXT                -- ISO timestamp
);
