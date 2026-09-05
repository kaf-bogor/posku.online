-- =============================================================
-- Normalisasi collection Firestore lain (dump JSON) -> tabel relasional
--   fs_events            -> fs_event + fs_event_activity
--   fs_news              -> fs_news_item + fs_news_activity
--   fs_kelas (wakaf)     -> fs_wakaf_kelas + fs_wakaf_kelas_participant + fs_wakaf_kelas_activity
--   fs_quizzes           -> fs_quiz + fs_quiz_question
--   fs_quiz_attempts     -> fs_quiz_attempt
--
-- Idempoten: derived tables dibersihkan dulu (sumber fs_* JSON dipertahankan).
-- Jalankan: npx wrangler d1 execute posku-db --remote --file=d1/normalize_misc.sql
-- =============================================================

PRAGMA foreign_keys = ON;

-- ============ EVENTS ============
CREATE TABLE IF NOT EXISTS fs_event (
  id              TEXT PRIMARY KEY,
  slug            TEXT,
  title           TEXT,
  summary         TEXT,
  image_urls      TEXT,        -- JSON array
  location        TEXT,
  start_date      TEXT,
  end_date        TEXT,
  is_active       INTEGER,     -- 0/1
  published       INTEGER,     -- 0/1 (nullable)
  created_at_iso  TEXT,
  created_at_epoch INTEGER
);

CREATE TABLE IF NOT EXISTS fs_event_activity (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id    TEXT NOT NULL REFERENCES fs_event(id) ON DELETE CASCADE,
  user_id     TEXT,
  user_name   TEXT,
  type        TEXT,
  description TEXT,
  datetime    TEXT
);
CREATE INDEX IF NOT EXISTS idx_fs_event_activity_event ON fs_event_activity (event_id);

-- ============ NEWS ============
CREATE TABLE IF NOT EXISTS fs_news_item (
  id              TEXT PRIMARY KEY,
  title           TEXT,
  summary         TEXT,
  type            TEXT,
  author          TEXT,
  is_published    INTEGER,     -- 0/1
  image_urls      TEXT,        -- JSON array
  publish_date    TEXT,
  created_at_iso  TEXT,
  created_at_epoch INTEGER
);

CREATE TABLE IF NOT EXISTS fs_news_activity (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  news_id     TEXT NOT NULL REFERENCES fs_news_item(id) ON DELETE CASCADE,
  user_id     TEXT,
  user_name   TEXT,
  type        TEXT,
  description TEXT,
  datetime    TEXT
);
CREATE INDEX IF NOT EXISTS idx_fs_news_activity_news ON fs_news_activity (news_id);

-- ============ KELAS / WAKAF (per kelas) ============
CREATE TABLE IF NOT EXISTS fs_wakaf_kelas (
  id            TEXT PRIMARY KEY,   -- nama kelas / "Gabungan"
  name          TEXT,
  target        INTEGER,
  collected     INTEGER,
  santri_count  INTEGER
);

CREATE TABLE IF NOT EXISTS fs_wakaf_kelas_participant (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id  TEXT NOT NULL REFERENCES fs_wakaf_kelas(id) ON DELETE CASCADE,
  name        TEXT,
  value       INTEGER,
  datetime    TEXT
);
CREATE INDEX IF NOT EXISTS idx_fs_wk_participant ON fs_wakaf_kelas_participant (program_id);

CREATE TABLE IF NOT EXISTS fs_wakaf_kelas_activity (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id  TEXT NOT NULL REFERENCES fs_wakaf_kelas(id) ON DELETE CASCADE,
  user_id     TEXT,
  user_name   TEXT,
  type        TEXT,
  description TEXT,
  datetime    TEXT
);
CREATE INDEX IF NOT EXISTS idx_fs_wk_activity ON fs_wakaf_kelas_activity (program_id);

-- ============ QUIZ ============
CREATE TABLE IF NOT EXISTS fs_quiz (
  id              TEXT PRIMARY KEY,
  title           TEXT,
  description     TEXT,
  time_limit      INTEGER,     -- menit
  level           TEXT,
  created_by      TEXT,
  created_at_iso  TEXT,
  updated_at_iso  TEXT
);

CREATE TABLE IF NOT EXISTS fs_quiz_question (
  id         TEXT,            -- id pertanyaan asli (q_...)
  quiz_id    TEXT NOT NULL REFERENCES fs_quiz(id) ON DELETE CASCADE,
  position   INTEGER,         -- urutan (dari index array)
  title      TEXT,
  answer     TEXT,
  level      TEXT,
  media      TEXT,
  options    TEXT,            -- JSON array pilihan
  PRIMARY KEY (quiz_id, position)
);
CREATE INDEX IF NOT EXISTS idx_fs_quiz_question_quiz ON fs_quiz_question (quiz_id);

-- ============ QUIZ ATTEMPT ============
CREATE TABLE IF NOT EXISTS fs_quiz_attempt (
  id              TEXT PRIMARY KEY,
  quiz_id         TEXT,
  user_id         TEXT,
  user_name       TEXT,
  user_email      TEXT,
  score           INTEGER,
  total_questions INTEGER,
  time_spent      INTEGER,    -- detik
  submitted_at    TEXT,
  answers         TEXT        -- JSON map question_id -> jawaban
);
CREATE INDEX IF NOT EXISTS idx_fs_quiz_attempt_quiz ON fs_quiz_attempt (quiz_id);
CREATE INDEX IF NOT EXISTS idx_fs_quiz_attempt_user ON fs_quiz_attempt (user_id);

-- =============================================================
-- Isi ulang (idempoten)
-- =============================================================

-- helper inline: createdAt yang konsisten (map firestore ATAU teks ISO)
-- dipakai berulang sebagai CASE ... END.

DELETE FROM fs_event_activity;
DELETE FROM fs_event;
DELETE FROM fs_news_activity;
DELETE FROM fs_news_item;
DELETE FROM fs_wakaf_kelas_activity;
DELETE FROM fs_wakaf_kelas_participant;
DELETE FROM fs_wakaf_kelas;
DELETE FROM fs_quiz_question;
DELETE FROM fs_quiz;
DELETE FROM fs_quiz_attempt;

-- ---------- events ----------
INSERT INTO fs_event (
  id, slug, title, summary, image_urls, location, start_date, end_date,
  is_active, published, created_at_iso, created_at_epoch
)
SELECT
  d.id,
  json_extract(d.data, '$.slug'),
  json_extract(d.data, '$.title'),
  json_extract(d.data, '$.summary'),
  json_extract(d.data, '$.imageUrls'),
  json_extract(d.data, '$.location'),
  json_extract(d.data, '$.startDate'),
  json_extract(d.data, '$.endDate'),
  CAST(json_extract(d.data, '$.isActive') AS INTEGER),
  CAST(json_extract(d.data, '$.published') AS INTEGER),
  CASE
    WHEN json_type(d.data, '$.createdAt') = 'object'
         AND json_type(d.data, '$.createdAt.seconds') = 'integer'
      THEN strftime('%Y-%m-%dT%H:%M:%SZ',
                    CAST(json_extract(d.data, '$.createdAt.seconds') AS INTEGER),
                    'unixepoch')
    WHEN json_type(d.data, '$.createdAt') = 'text'
      THEN json_extract(d.data, '$.createdAt')
    ELSE NULL
  END,
  CASE
    WHEN json_type(d.data, '$.createdAt') = 'object'
         AND json_type(d.data, '$.createdAt.seconds') = 'integer'
      THEN CAST(json_extract(d.data, '$.createdAt.seconds') AS INTEGER)
    ELSE NULL
  END
FROM fs_events d;

INSERT INTO fs_event_activity (event_id, user_id, user_name, type, description, datetime)
SELECT
  d.id,
  json_extract(e.value, '$.userId'),
  json_extract(e.value, '$.userName'),
  json_extract(e.value, '$.type'),
  json_extract(e.value, '$.description'),
  json_extract(e.value, '$.datetime')
FROM fs_events d
JOIN json_each(d.data, '$.activities') AS e
WHERE json_type(d.data, '$.activities') = 'array';

-- ---------- news ----------
INSERT INTO fs_news_item (
  id, title, summary, type, author, is_published, image_urls, publish_date,
  created_at_iso, created_at_epoch
)
SELECT
  d.id,
  json_extract(d.data, '$.title'),
  json_extract(d.data, '$.summary'),
  json_extract(d.data, '$.type'),
  json_extract(d.data, '$.author'),
  CAST(json_extract(d.data, '$.isPublished') AS INTEGER),
  json_extract(d.data, '$.imageUrls'),
  json_extract(d.data, '$.publishDate'),
  CASE
    WHEN json_type(d.data, '$.createdAt') = 'object'
         AND json_type(d.data, '$.createdAt.seconds') = 'integer'
      THEN strftime('%Y-%m-%dT%H:%M:%SZ',
                    CAST(json_extract(d.data, '$.createdAt.seconds') AS INTEGER),
                    'unixepoch')
    WHEN json_type(d.data, '$.createdAt') = 'text'
      THEN json_extract(d.data, '$.createdAt')
    ELSE NULL
  END,
  CASE
    WHEN json_type(d.data, '$.createdAt') = 'object'
         AND json_type(d.data, '$.createdAt.seconds') = 'integer'
      THEN CAST(json_extract(d.data, '$.createdAt.seconds') AS INTEGER)
    ELSE NULL
  END
FROM fs_news d;

INSERT INTO fs_news_activity (news_id, user_id, user_name, type, description, datetime)
SELECT
  d.id,
  json_extract(e.value, '$.userId'),
  json_extract(e.value, '$.userName'),
  json_extract(e.value, '$.type'),
  json_extract(e.value, '$.description'),
  json_extract(e.value, '$.datetime')
FROM fs_news d
JOIN json_each(d.data, '$.activities') AS e
WHERE json_type(d.data, '$.activities') = 'array';

-- ---------- kelas (wakaf per kelas) ----------
INSERT INTO fs_wakaf_kelas (id, name, target, collected, santri_count)
SELECT
  d.id,
  json_extract(d.data, '$.name'),
  json_extract(d.data, '$.target'),
  json_extract(d.data, '$.collected'),
  json_extract(d.data, '$.santriCount')
FROM fs_kelas d;

INSERT INTO fs_wakaf_kelas_participant (program_id, name, value, datetime)
SELECT
  d.id,
  json_extract(e.value, '$.name'),
  json_extract(e.value, '$.value'),
  json_extract(e.value, '$.datetime')
FROM fs_kelas d
JOIN json_each(d.data, '$.participants') AS e
WHERE json_type(d.data, '$.participants') = 'array';

INSERT INTO fs_wakaf_kelas_activity (program_id, user_id, user_name, type, description, datetime)
SELECT
  d.id,
  json_extract(e.value, '$.userId'),
  json_extract(e.value, '$.userName'),
  json_extract(e.value, '$.type'),
  json_extract(e.value, '$.description'),
  json_extract(e.value, '$.datetime')
FROM fs_kelas d
JOIN json_each(d.data, '$.activities') AS e
WHERE json_type(d.data, '$.activities') = 'array';

-- ---------- quizzes ----------
INSERT INTO fs_quiz (id, title, description, time_limit, level, created_by, created_at_iso, updated_at_iso)
SELECT
  d.id,
  json_extract(d.data, '$.title'),
  json_extract(d.data, '$.description'),
  json_extract(d.data, '$.timeLimit'),
  json_extract(d.data, '$.level'),
  json_extract(d.data, '$.createdBy'),
  json_extract(d.data, '$.createdAt'),
  json_extract(d.data, '$.updatedAt')
FROM fs_quizzes d;

INSERT INTO fs_quiz_question (id, quiz_id, position, title, answer, level, media, options)
SELECT
  json_extract(e.value, '$.id'),
  d.id,
  e.key,                       -- index array = urutan pertanyaan
  json_extract(e.value, '$.title'),
  json_extract(e.value, '$.answer'),
  json_extract(e.value, '$.level'),
  json_extract(e.value, '$.media'),
  json_extract(e.value, '$.options')
FROM fs_quizzes d
JOIN json_each(d.data, '$.questions') AS e
WHERE json_type(d.data, '$.questions') = 'array';

-- ---------- quiz attempts ----------
INSERT INTO fs_quiz_attempt (
  id, quiz_id, user_id, score, total_questions, time_spent, submitted_at, answers
)
SELECT
  d.id,
  json_extract(d.data, '$.quizId'),
  json_extract(d.data, '$.userId'),
  json_extract(d.data, '$.score'),
  json_extract(d.data, '$.totalQuestions'),
  json_extract(d.data, '$.timeSpent'),
  json_extract(d.data, '$.submittedAt'),
  json_extract(d.data, '$.answers')
FROM fs_quiz_attempts d;
