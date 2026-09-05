import { useEffect, useState } from 'react';

import { listAttendanceRecords } from '~/lib/services/attendanceService';
import type { AttendanceRecordDTO } from '~/lib/types/attendance';

export default function useAttendanceRecords(eventId: string) {
  const [records, setRecords] = useState<AttendanceRecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setRecords([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    const load = async () => {
      try {
        const data = await listAttendanceRecords(eventId);
        if (active) {
          setRecords(data);
          setError(null);
        }
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : 'Gagal memuat');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [eventId]);

  return { records, loading, error };
}
