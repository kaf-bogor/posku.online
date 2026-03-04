import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '~/lib/firebase';
import type { AttendanceEventDTO } from '~/lib/types/attendance';

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
        const items: AttendanceEventDTO[] = snap.docs.map((d) => {
          const data = d.data() as {
            title?: string;
            description?: string;
            date?: { toDate: () => Date };
            createdAt?: { toDate: () => Date };
            createdBy?: string;
          };

          return {
            id: d.id,
            title: data.title ?? '',
            description: data.description ?? '',
            date: data.date
              ? data.date.toDate().toISOString()
              : new Date(0).toISOString(),
            createdAt: data.createdAt
              ? data.createdAt.toDate().toISOString()
              : new Date(0).toISOString(),
            createdBy: data.createdBy ?? '',
          };
        });
        setEvents(items);
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
