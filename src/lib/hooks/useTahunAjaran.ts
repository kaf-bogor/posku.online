'use client';

import { useEffect, useState } from 'react';

import { fetchJson } from '~/lib/config/d1';

export function useTahunAjaran<T>({
  tahun,
  fallback,
}: {
  tahun: string;
  fallback: T;
}): { data: T; source: 'json' | 'd1'; loading: boolean } {
  const [data, setData] = useState<T>(fallback);
  const [source, setSource] = useState<'json' | 'd1'>('json');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchJson<{ data: T }>(
          `/api/tahun-ajaran?tahun=${encodeURIComponent(tahun)}`
        );
        if (!cancelled && res && Array.isArray(res.data)) {
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
  }, [tahun, fallback]);

  return { data, source, loading };
}
