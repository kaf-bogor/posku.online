import type { LevelId, ModulId } from '~/lib/types/belajar';

export interface ModulMeta {
  id: ModulId;
  label: string;
  emoji: string;
  desc: string;
  isMath: boolean;
}

export const MODULES: ModulMeta[] = [
  {
    id: 'spok',
    label: 'SPOK',
    emoji: '📝',
    desc: 'Belajar Subjek, Predikat, Objek, dan Keterangan.',
    isMath: false,
  },
  {
    id: 'penjumlahan',
    label: 'Penjumlahan',
    emoji: '➕',
    desc: 'Menjumlah bilangan dengan cara mudah.',
    isMath: true,
  },
  {
    id: 'pengurangan',
    label: 'Pengurangan',
    emoji: '➖',
    desc: 'Mengurangi bilangan dan mencari selisih.',
    isMath: true,
  },
  {
    id: 'perkalian',
    label: 'Perkalian',
    emoji: '✖️',
    desc: 'Perkalian sebagai penjumlahan berulang.',
    isMath: true,
  },
  {
    id: 'pembagian',
    label: 'Pembagian',
    emoji: '➗',
    desc: 'Membagi rata dan pembagian bersisa.',
    isMath: true,
  },
];

export const LEVELS: { id: LevelId; label: string }[] = [
  { id: 'mudah', label: 'Mudah' },
  { id: 'sedang', label: 'Sedang' },
  { id: 'sulit', label: 'Sulit' },
];

export function getModul(id: string): ModulMeta | undefined {
  return MODULES.find((m) => m.id === id);
}

export function isModulId(value: string): value is ModulId {
  return MODULES.some((m) => m.id === value);
}
