'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchJson } from '~/lib/config/d1';
import type { DataWaliSantriRecord } from '~/lib/types/data_wali_santri';

type WaliResponse = { data: DataWaliSantriRecord[]; count: number };

/**
 * Muat data potensi wali santri dari D1 (worker posku-d1 /api/wali).
 * Tanpa fallback JSON statis: data murni dari D1.
 */
export function useWaliSantri(): {
  data: DataWaliSantriRecord[];
  loading: boolean;
  error: boolean;
  reload: () => void;
} {
  const [data, setData] = useState<DataWaliSantriRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    async function load() {
      const res = await fetchJson<WaliResponse>('/api/wali');
      if (cancelled) return;
      if (res && Array.isArray(res.data) && res.data.length) {
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
  }, [nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, reload };
}
