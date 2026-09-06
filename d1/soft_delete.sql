-- Soft delete: tambah kolom is_delete ke resource yang memakai delete.
ALTER TABLE fs_news_item ADD COLUMN is_delete INTEGER DEFAULT 0;
ALTER TABLE fs_event ADD COLUMN is_delete INTEGER DEFAULT 0;
ALTER TABLE fs_newsletter ADD COLUMN is_delete INTEGER DEFAULT 0;
ALTER TABLE fs_quiz ADD COLUMN is_delete INTEGER DEFAULT 0;
