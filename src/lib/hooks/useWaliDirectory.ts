'use client';

import { useEffect, useState } from 'react';

import { fetchJson } from '~/lib/config/d1';
import type { DataWaliSantriRecord } from '~/lib/types/data_wali_santri';

type WaliResponse = { data: DataWaliSantriRecord[]; count: number };

let cache: DataWaliSantriRecord[] | null = null;
let inflight: Promise<DataWaliSantriRecord[]> | null = null;

function load(): Promise<DataWaliSantriRecord[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetchJson<WaliResponse>('/api/wali')
      .then((res) => {
        cache = res && Array.isArray(res.data) ? res.data : [];
        return cache;
      })
      .catch(() => {
        cache = [];
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * Direktori wali santri (nama orang tua + no HP) yang dipakai untuk membuat
 * tautan WhatsApp pada nama PIC. Dimuat dari D1 satu kali lalu di-cache per
 * sesi — tidak lagi menyertakan JSON statis ke bundle.
 */
export function useWaliDirectory(): {
  data: DataWaliSantriRecord[];
  loading: boolean;
} {
  const [data, setData] = useState<DataWaliSantriRecord[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let active = true;
    if (cache) {
      setLoading(false);
      return undefined;
    }
    load().then((d) => {
      if (active) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { data, loading };
}
