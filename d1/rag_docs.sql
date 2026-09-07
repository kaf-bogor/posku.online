-- =============================================================
-- RAG dokumen publik POSKU (modul PDF + kalender + konten fs_*)
-- Tabel bantu untuk worker posku-rag-docs.
--   fs_docs      : teks sumber yang TIDAK ada di tabel fs_* lain
--                  (isi PDF "Modul Kuttab & Madrasah" + isi kalender_posku.json).
--                  Konten situs (fs_event, fs_news_item, dst) dibaca langsung
--                  oleh worker dari tabel aslinya.
--   fs_rag_state : menyimpan id vektor hasil index terakhir agar worker bisa
--                  menghapus vektor yg sudah tidak relevan (stale) saat rebuild.
--
-- Jalankan: npx wrangler d1 execute posku-db --remote --file=d1/rag_docs.sql
-- =============================================================

CREATE TABLE IF NOT EXISTS fs_docs (
  id         TEXT PRIMARY KEY,   -- mis. 'mod-p12', 'kal-2026-08-02-rakor'
  source     TEXT NOT NULL,      -- 'modul' | 'kalender'
  kind       TEXT,               -- 'halaman' | 'event' | 'holiday' | 'ongoing' | 'info'
  title      TEXT,               -- judul singkat
  text       TEXT NOT NULL,      -- teks utk di-embed
  meta       TEXT,               -- JSON opsional (tanggal, kategori, dst)
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS fs_rag_state (
  id         TEXT PRIMARY KEY,   -- selalu 'docs'
  vector_ids TEXT,               -- JSON array id vektor yang terakhir di-upsert
  indexed_at TEXT
);
