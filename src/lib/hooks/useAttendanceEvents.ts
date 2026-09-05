import { useEffect, useState } from 'react';

import { listAttendanceEvents } from '~/lib/services/attendanceService';
import type { AttendanceEventDTO } from '~/lib/types/attendance';

export default function useAttendanceEvents() {
  const [events, setEvents] = useState<AttendanceEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await listAttendanceEvents();
        if (active) {
          setEvents(data);
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
    const interval = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return { events, loading, error };
}
