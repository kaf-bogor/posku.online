import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '~/lib/firebase';
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

    const q = query(
      collection(db, 'attendanceRecords'),
      where('eventId', '==', eventId),
      orderBy('checkedInAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: AttendanceRecordDTO[] = snap.docs.map((d) => {
          const data = d.data() as {
            eventId?: string;
            userEmail?: string;
            checkedInAt?: { toDate: () => Date };
          };

          return {
            id: d.id,
            eventId: data.eventId ?? eventId,
            userEmail: data.userEmail ?? '',
            checkedInAt: data.checkedInAt
              ? data.checkedInAt.toDate().toISOString()
              : new Date(0).toISOString(),
          };
        });
        setRecords(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [eventId]);

  return { records, loading, error };
}
