'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchJson } from '~/lib/config/d1';

/**
 * Muat pembagian kelas + santri per tahun ajaran dari D1 (worker posku-d1).
 * Tanpa fallback JSON statis: data murni dari D1.
 */
export function useTahunAjaran<T>(tahun: string): {
  data: T | null;
  loading: boolean;
  error: boolean;
  reload: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    async function load() {
      const res = await fetchJson<{ data: T }>(
        `/api/tahun-ajaran?tahun=${encodeURIComponent(tahun)}`
      );
      if (cancelled) return;
      if (res && Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setError(true);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tahun, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, reload };
}
