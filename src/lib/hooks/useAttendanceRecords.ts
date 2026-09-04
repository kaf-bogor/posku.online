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
import { mapAttendanceRecord } from '~/lib/utils/attendance';

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
        setRecords(
          snap.docs.map((d) => mapAttendanceRecord(d.id, d.data(), eventId))
        );
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
