export type KategoriUtama =
  | 'pendidikan'
  | 'wiraswasta'
  | 'profesional'
  | 'belum_terisi';

export interface DataWaliSantriRecord {
  id: number;
  email: string;
  nama_ayah: string;
  no_hp_ayah: string;
  nama_ibu: string;
  no_hp_ibu: string;
  nama_anak: string;
  kelas_anak: string;
  alamat_rumah: string;
  pekerjaan_utama_ayah: string;
  nama_instansi: string;
  bidang_pekerjaan_ayah: string;
  peran_di_pekerjaan: string;
  keahlian_ayah: string;
  hobi_minat: string;
  ayah_bersedia_posku: string;
  bidang_diminati_ayah: string;
  ayah_pernah_panitia_posku: string;
  kegiatan_ayah: string;
  ibu_bersedia_posku: string;
  bidang_diminati_ibu: string;
  ibu_pernah_panitia_posku: string;
  kegiatan_ibu: string;
  ayah_bersedia_tawaf: string;
  kontribusi_tawaf: string;
  saran_masukan: string;
  kategori: KategoriUtama;
  subkategori: string | null;
  lat: number | null;
  lon: number | null;
  lokasi: string | null;
}
