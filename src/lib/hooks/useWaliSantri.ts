'use client';

import { useEffect, useState } from 'react';

import { fetchJson } from '~/lib/config/d1';
import type { DataWaliSantriRecord } from '~/lib/types/data_wali_santri';

type WaliResponse = { data: DataWaliSantriRecord[]; count: number };

export function useWaliSantri(fallback: DataWaliSantriRecord[]): {
  data: DataWaliSantriRecord[];
  source: 'json' | 'd1';
  loading: boolean;
} {
  const [data, setData] = useState<DataWaliSantriRecord[]>(fallback);
  const [source, setSource] = useState<'json' | 'd1'>('json');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchJson<WaliResponse>('/api/wali');
        if (!cancelled && res && Array.isArray(res.data) && res.data.length) {
          setData(res.data);
          setSource('d1');
        }
      } catch {
        // fallback ke JSON tetap
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, source, loading };
}
