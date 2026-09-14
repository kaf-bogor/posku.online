-- =============================================================
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
  ('samudbr@gmail.com', 'Bimo Rekso Samudro', 'Ketua Posku', 'pengurus', '2026-09-14T05:25:27.596Z'),
  ('trestyani0729@gmail.com', 'Tia Restyani', 'Ketua Posku', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('apandi16@gmail.com', 'Rifki Apandi', 'Sekretaris', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('nnurlela16@gmail.com', 'Nurlela', 'Sekretaris', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('jupri.supriadi@gmail.com', 'Jupri Supriadi', 'Sekretaris', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('shivaulya208@gmail.com', 'Shiva Ulya Azizah', 'Sekretaris', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('girindra.wardhana.2013@gmail.com', 'Girindra Wardhana', 'Bendahara', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('widyafitriyanti31@gmail.com', 'Widya Fitriyanti', 'Bendahara', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('yerrie76@gmail.com', 'Ronny Yerrie', 'Bendahara', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('sastiambar@gmail.com', 'Sasti Ambarwati Nursani', 'Bendahara', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('sureukis.283@gmail.com', 'Muhlis Prasetyo', 'Media', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('nurlikacahyani@gmail.com', 'Nurlika Cahyani', 'Media', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('kubido@gmail.com', 'Rifki Fauzi', 'Media', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('eq.ardhana@gmail.com', 'Mas Ecky Adhana', 'Media', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('intan.dwita@gmail.com', 'Intan Dwita Kemala', 'Media', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('fphasry@gmail.com', 'Febriandy P H', 'Tarbiyah - KBO', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('prasetya.kreatif@gmail.com', 'R. Prasetya Darma Putranto', 'Tarbiyah - KBO', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('msolehudin.mm@gmail.com', 'Muhamad Solehudin', 'Tarbiyah - KBO', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('dd.ahmad.m.hd@gmail.com', 'Dede Ahmad Mukhtarom', 'Tarbiyah - Kajian Qowamah', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('yanissawiti12@gmail.com', 'Muhammad Yanis Sawiti', 'Tarbiyah - Kajian Qowamah', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('achmadsyaefillah309@gmail.com', 'Achmad Syaefillah', 'Tarbiyah - Tahsin', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('adamlubis13@gmail.com', 'Adam Malik Lubis', 'Tarbiyah - Tahsin', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('dika290184@gmail.com', 'Helman Wijaya', 'Tarbiyah - Sentra Literasi', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('jundullah0709@gmail.com', 'Agus Setiawan', 'Tarbiyah - Sentra Literasi', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('septian.shum@gmail.com', 'Septian AW', 'Tarbiyah - Sentra Literasi', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('wanyoga@yahoo.com', 'Wan Yoga', 'Ukhuwah - Sentra Sehat dan Bugar', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('muhammad.hc.lucky@gmail.com', 'Muhammad Ridwan', 'Ukhuwah - Sentra Sehat dan Bugar', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('karjito33@gmail.com', 'Karjito', 'Ukhuwah - Sentra Sehat dan Bugar', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('suhardiman1977@gmail.com', 'Suhardiman', 'Ukhuwah - Sentra Sosial dan Kreatif', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('sopian.lucky@gmail.com', 'Ahmad Sopian', 'Ukhuwah - Sentra Sosial dan Kreatif', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('rantifutiawati@gmail.com', 'Ranti Futiawati', 'Tarbiyah - Kajian Ummahat', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('lindasoleh12@gmail.com', 'Linda Puspita Sari', 'Tarbiyah - Sentra Literasi/Tarbiyah - Kajian Ummahat', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('bukupintu20@gmail.com', 'Yopi Rahayu', 'Tarbiyah - Sentra Literasi', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('ahmadbman@gmail.com', 'Novi Pratiwi', 'Tarbiyah - Kajian Ummahat', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('ghia.radhita@yahoo.com', 'Ghia Astri Raditha', 'Tarbiyah - Tahsin Ummahat', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('nda.mars@gmail.com', 'Linda Kurnia', 'Tarbiyah - Tahsin Ummahat', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('destriyantisuwandi@gmail.com', 'Destriyanti', 'Tarbiyah - Tahsin Ummahat', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('noor.baiti28@gmail.com', 'Noor Baiti', 'Tarbiyah - Tahsin Ummahat/ Ukhuwah - Sentra Sehat', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('umiyasmin@gmail.com', 'Evi Yusmiawati', 'Tarbiyah - Tahsin Ummahat', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('tiani.nov@gmail.com', 'Tiani Novyanti', 'Ukhuwah - Sentra Sehat', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('reti.cute@gmail.com', 'Tri Reti Rahmawati', 'Ukhuwah - Sentra Bugar', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('yuyunnovia1211@gmail.com', 'Yuyun Novia', 'Ukhuwah - Sentra Bugar/ Tarbiyah - Kajian Ummahat', 'pengurus', '2026-09-14T05:25:27.598Z'),
  ('pujirahayu4785@gmail.com', 'Puji Rahayu', 'Ukhuwah - Sentra Kreatif', 'pengurus', '2026-09-14T05:25:27.598Z')
ON CONFLICT(email) DO UPDATE SET
  nama = excluded.nama,
  divisi = excluded.divisi,
  role = excluded.role;
