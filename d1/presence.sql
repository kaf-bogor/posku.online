-- Kehadiran online (presence) pengguna login.
CREATE TABLE IF NOT EXISTS fs_presence (
  id        TEXT PRIMARY KEY,   -- uid Firebase
  email     TEXT,
  name      TEXT,
  last_seen INTEGER NOT NULL    -- epoch ms
);
