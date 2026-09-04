import type { KategoriUtama } from '~/lib/types/data_wali_santri';

export const KATEGORI_ORDER: KategoriUtama[] = [
  'pendidikan',
  'wiraswasta',
  'profesional',
  'belum_terisi',
];

export const KATEGORI_META: Record<
  KategoriUtama,
  { label: string; color: string }
> = {
  pendidikan: { label: 'Pendidikan', color: 'green' },
  wiraswasta: { label: 'Wiraswasta', color: 'orange' },
  profesional: { label: 'Profesional', color: 'blue' },
  belum_terisi: { label: 'Belum Terisi', color: 'gray' },
};

export const KATEGORI_HEX: Record<KategoriUtama, string> = {
  pendidikan: '#2F855A',
  wiraswasta: '#DD6B20',
  profesional: '#3182CE',
  belum_terisi: '#A0AEC0',
};

export function kategoriLabel(k: KategoriUtama): string {
  return KATEGORI_META[k]?.label ?? 'Lainnya';
}

export function splitByComma(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Pair child names with their classes positionally. Both fields are stored
 * comma-separated in matching order, e.g.
 *   nama_anak: "Ayah1, Ayah2"  kelas_anak: "Kuttab Awal 1C, Qonuni 2A"
 */
export function childClassPairs(record: {
  nama_anak: string | null | undefined;
  kelas_anak: string | null | undefined;
}): { name: string; kelas: string }[] {
  const names = splitByComma(record.nama_anak);
  const kelas = splitByComma(record.kelas_anak);
  const length = Math.max(names.length, kelas.length);
  return Array.from({ length }, (_, i) => ({
    name: names[i] ?? '',
    kelas: kelas[i] ?? '',
  }));
}
