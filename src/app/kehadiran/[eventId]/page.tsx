import type { Timestamp } from 'firebase/firestore';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

import { db } from '~/lib/firebase';
import type {
  AttendanceEventDTO,
  AttendanceRecordDTO,
} from '~/lib/types/attendance';

import KehadiranEventDetailClient from './components/KehadiranEventDetailClient';

async function getEvent(eventId: string): Promise<AttendanceEventDTO | null> {
  const ref = doc(db, 'attendanceEvents', eventId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as {
    title?: string;
    description?: string;
    date?: Timestamp;
    createdAt?: Timestamp;
    createdBy?: string;
  };

  return {
    id: snap.id,
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
}

async function getRecords(eventId: string): Promise<AttendanceRecordDTO[]> {
  const q = query(
    collection(db, 'attendanceRecords'),
    where('eventId', '==', eventId),
    orderBy('checkedInAt', 'desc')
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as {
      eventId?: string;
      userEmail?: string;
      checkedInAt?: Timestamp;
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
}

export default async function KehadiranEventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const [event, records] = await Promise.all([
    getEvent(eventId),
    getRecords(eventId),
  ]);

  return (
    <KehadiranEventDetailClient
      event={event}
      records={records}
      eventId={eventId}
    />
  );
}
