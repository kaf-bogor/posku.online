import { env } from 'cloudflare:workers';

import { LEVELS } from '~/lib/belajar/modules';
import type { LevelId, MateriStep, ModulId } from '~/lib/types/belajar';

interface MateriDbRow {
  id: string;
  modul: string;
  level: string;
  urutan: number;
  judul: string;
  isi: string;
}

/** Ambil materi (langkah) semua level untuk satu modul dari D1. */
export async function getMateriByModul(
  modul: ModulId
): Promise<Record<LevelId, MateriStep[]>> {
  const empty: Record<LevelId, MateriStep[]> = {
    mudah: [],
    sedang: [],
    sulit: [],
  };

  try {
    const { results } = await env.DB.prepare(
      'SELECT id, modul, level, urutan, judul, isi FROM belajar_materi WHERE modul = ? ORDER BY urutan'
    )
      .bind(modul)
      .all<MateriDbRow>();

    results.forEach((row) => {
      const level = row.level as LevelId;
      if (!LEVELS.some((l) => l.id === level)) return;
      try {
        const steps = JSON.parse(row.isi) as MateriStep[];
        if (Array.isArray(steps)) empty[level] = steps;
      } catch {
        // lewati baris rusak
      }
    });
  } catch {
    // D1 tidak tersedia — kembalikan kosong
  }

  return empty;
}
