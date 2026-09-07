# POSKU Al‑Fatih Bogor

**POSKU** (Persatuan Orang tua Santri Kuttab Al‑Fatih Bogor) adalah **wadah informal** untuk memfasilitasi orang tua santri (OTS) dalam mendukung proses belajar di Kuttab Al‑Fatih.

---

## Apa Tujuan dan Tugasnya?

- 🌱 **Tujuan**: Membantu para Orang Tua Santri (OTS) untuk ikut berperan aktif dalam pendidikan anak-anak, tidak hanya sekadar mengantar jemput, tapi juga berkontribusi nyata.
- 💬 **Koordinasi & Fasilitasi**: Menjadi jembatan antara pihak Kuttab dan OTS, membantu kelancaran kegiatan belajar, kebersihan, kajian, dan aktivitas sosial lainnya.
- 🤝 **Berbagi Inspirasi**: Menjadi forum bagi para OTS untuk saling belajar, berbagi pengalaman, ide, dan langkah-langkah positif.

---

## Contoh Program Kerja POSKU

- Membantu kegiatan belajar-mengajar santri
- Membuat website/blog & menyebarkan info via SMS blast
- Mengadakan gerakan kebersihan lingkungan Kuttab
- Menyelenggarakan kajian rutin untuk Ayah dan Bunda (Bahasa Arab, Tajwid, Adab, Akhlak)
- Membentuk Koordinator Kelas (Korlas) untuk setiap kelas
- Mengadakan kegiatan olahraga, camping, dan bazar
- Memfasilitasi forum usaha & mentoring bisnis
- Mengadakan Iftar bersama & I’tikaf di bulan Ramadhan

---

## Kontak & Info Lebih Lanjut

- 🌐 Kunjungi website kami di [poskubogor.com](https://www.poskubogor.com)
- Cari menu: *Tentang POSKU*, *Pengurus*, *Newsletter*, atau *Muslimah Center*

---

## 🚀 Bismillah: Panduan Kontribusi Teknis

Alhamdulillah, kami sangat bersyukur dan berterima kasih atas niat Ayah/Bunda untuk ikut berkontribusi dalam pengembangan proyek ini. Semoga setiap baris kode dan usaha yang dicurahkan menjadi ladang amal jariyah. Aamiin.

Berikut adalah panduan teknis untuk memulai.

### Teknologi yang Digunakan

- **Next.js**: Framework React untuk production.
- **Chakra UI**: Komponen UI yang modern dan aksesibel.
- **Google OAuth**: Autentikasi admin langsung via Google.
- **Cloudflare**: Worker API, database D1, vector database (Vectorize), dan R2.
- **Vercel**: Hosting & deployment aplikasi Next.js.
- **TypeScript**: Untuk menjaga kualitas dan struktur kode.

### Cara Setup Proyek Lokal

1.  **Clone Repositori**

    ```bash
    git clone https://github.com/kubido/posku.online.git
    cd posku.online
    ```

2.  **Install Dependencies**

    ```bash
    pnpm install
    ```

3.  **Konfigurasi Environment Variables**

    Salin file `.env.example` menjadi `.env.local` (jika ada), atau buat file `.env.local` secara manual di root proyek. Isi semua variabel yang dibutuhkan seperti pada panduan di bawah.

4.  **Jalankan Server Development**

    ```bash
    pnpm dev
    ```

    Silakan buka [http://localhost:3000](http://localhost:3000) di browser Antum untuk melihat hasilnya.

### Kebutuhan Environment Variables

Pastikan semua variabel ini telah diatur di dalam file `.env.local` Antum agar aplikasi dapat berjalan dengan baik.

#### Konfigurasi Google OAuth
Buat OAuth Client (Web application) di Google Cloud Console, lalu daftarkan redirect URI:
`https://poskubogor.com/api/auth/callback/google` dan `http://localhost:4001/api/auth/callback/google`.

```
GOOGLE_CLIENT_ID=isi-dengan-client-id
GOOGLE_CLIENT_SECRET=isi-dengan-client-secret
```

#### Konfigurasi Vercel Blob Storage
Agar fitur unggah gambar dapat berfungsi, Antum perlu melakukan setup Vercel Blob Storage.

1.  **Buat Vercel Blob Store**: Silakan ikuti [dokumentasi resmi Vercel](https://vercel.com/docs/storage/vercel-blob/quickstart) untuk membuat Blob Store baru di proyek Vercel Antum.
2.  **Buat Read-Write Token**: Di dasbor proyek Vercel, masuk ke pengaturan Blob Store, lalu buat token *read-write* yang baru.
3.  **Tambahkan ke .env.local**:

    ```
    BLOB_READ_WRITE_TOKEN=isi-dengan-token-dari-vercel
    ```

    Mohon ganti `isi-dengan-token-dari-vercel` dengan token yang baru saja Antum buat.

---

Jazakumullah khairan katsiran atas kontribusinya. Mari kita bangun platform ini bersama demi mendukung pendidikan generasi rabbani. Barakallahu fiikum.