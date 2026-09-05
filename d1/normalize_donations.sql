-- =============================================================
-- Normalisasi fs_donations (dump JSON Firestore) -> 3 tabel relasional
--   fs_donation           : 1 baris per campaign
--   fs_donor              : 1 baris per donatur (FK ke fs_donation)
--   fs_donation_activity  : 1 baris per aktivitas edit (FK ke fs_donation)
--
-- Idempoten: aman dijalankan ulang (derived tables dibersihkan dulu).
-- Sumber data (fs_donations) sengaja dipertahankan sebagai referensi.
-- Jalankan: npx wrangler d1 execute posku-db --remote --file=d1/normalize_donations.sql
-- =============================================================

PRAGMA foreign_keys = ON;

-- ---------- Tabel ----------
CREATE TABLE IF NOT EXISTS fs_donation (
  id                 TEXT PRIMARY KEY,
  slug               TEXT,
  title              TEXT,
  summary            TEXT,
  target             INTEGER,
  link               TEXT,
  image_urls         TEXT,      -- JSON array string
  donors_count       INTEGER,
  sort_order         INTEGER,   -- field "order"
  published          INTEGER,   -- 0/1
  is_active          INTEGER,   -- 0/1
  organizer_name     TEXT,
  organizer_avatar   TEXT,
  organizer_tagline  TEXT,
  created_at         INTEGER,   -- epoch seconds
  created_at_iso     TEXT       -- UTC ISO string
);

CREATE TABLE IF NOT EXISTS fs_donor (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_id   TEXT NOT NULL REFERENCES fs_donation(id) ON DELETE CASCADE,
  source_id     INTEGER,        -- donor.id asli di Firestore
  name          TEXT,
  value         INTEGER,        -- nominal (Rp)
  donors_count  INTEGER,        -- agregasi jika 1 entri mewakili banyak donatur
  datetime      TEXT            -- teks tanggal asli
);
CREATE INDEX IF NOT EXISTS idx_fs_donor_donation ON fs_donor (donation_id);
CREATE INDEX IF NOT EXISTS idx_fs_donor_source   ON fs_donor (source_id);

CREATE TABLE IF NOT EXISTS fs_donation_activity (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_id   TEXT NOT NULL REFERENCES fs_donation(id) ON DELETE CASCADE,
  user_id       TEXT,
  user_name     TEXT,
  type          TEXT,           -- add | edit | remove | ...
  description   TEXT,
  datetime      TEXT
);
CREATE INDEX IF NOT EXISTS idx_fs_activity_donation ON fs_donation_activity (donation_id);
CREATE INDEX IF NOT EXISTS idx_fs_activity_datetime ON fs_donation_activity (datetime);

-- ---------- Isi ulang (idempoten) ----------
DELETE FROM fs_donation_activity;
DELETE FROM fs_donor;
DELETE FROM fs_donation;

INSERT INTO fs_donation (
  id, slug, title, summary, target, link, image_urls, donors_count,
  sort_order, published, is_active, organizer_name, organizer_avatar,
  organizer_tagline, created_at, created_at_iso
)
SELECT
  d.id,
  json_extract(d.data, '$.slug'),
  json_extract(d.data, '$.title'),
  json_extract(d.data, '$.summary'),
  json_extract(d.data, '$.target'),
  json_extract(d.data, '$.link'),
  json_extract(d.data, '$.imageUrls'),
  json_extract(d.data, '$.donorsCount'),
  json_extract(d.data, '$.order'),
  CAST(json_extract(d.data, '$.published') AS INTEGER),
  CAST(json_extract(d.data, '$.is_active') AS INTEGER),
  json_extract(d.data, '$.organizer.name'),
  json_extract(d.data, '$.organizer.avatar'),
  json_extract(d.data, '$.organizer.tagline'),
  json_extract(d.data, '$.createdAt.seconds'),
  CASE WHEN json_type(d.data, '$.createdAt.seconds') = 'integer'
       THEN strftime('%Y-%m-%dT%H:%M:%SZ',
                     CAST(json_extract(d.data, '$.createdAt.seconds') AS INTEGER),
                     'unixepoch')
       ELSE NULL END
FROM fs_donations d;

INSERT INTO fs_donor (donation_id, source_id, name, value, donors_count, datetime)
SELECT
  d.id,
  json_extract(e.value, '$.id'),
  json_extract(e.value, '$.name'),
  json_extract(e.value, '$.value'),
  json_extract(e.value, '$.donorsCount'),
  json_extract(e.value, '$.datetime')
FROM fs_donations d
JOIN json_each(d.data, '$.donors') AS e
WHERE json_type(d.data, '$.donors') = 'array';

INSERT INTO fs_donation_activity (donation_id, user_id, user_name, type, description, datetime)
SELECT
  d.id,
  json_extract(e.value, '$.userId'),
  json_extract(e.value, '$.userName'),
  json_extract(e.value, '$.type'),
  json_extract(e.value, '$.description'),
  json_extract(e.value, '$.datetime')
FROM fs_donations d
JOIN json_each(d.data, '$.activities') AS e
WHERE json_type(d.data, '$.activities') = 'array';
