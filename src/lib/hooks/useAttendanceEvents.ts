import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '~/lib/firebase';
import type { AttendanceEventDTO } from '~/lib/types/attendance';
import { mapAttendanceEvent } from '~/lib/utils/attendance';

export default function useAttendanceEvents() {
  const [events, setEvents] = useState<AttendanceEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'attendanceEvents'),
      orderBy('date', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setEvents(snap.docs.map((d) => mapAttendanceEvent(d.id, d.data())));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { events, loading, error };
}
