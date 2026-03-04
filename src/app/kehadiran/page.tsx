import { collection, getDocs, orderBy, query } from 'firebase/firestore';

import { db } from '~/lib/firebase';
import type { AttendanceEventDTO } from '~/lib/types/attendance';

import KehadiranPageClient from './components/KehadiranPageClient';

async function getAttendanceEvents(): Promise<AttendanceEventDTO[]> {
  const q = query(collection(db, 'attendanceEvents'), orderBy('date', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
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
}

export default async function KehadiranPage() {
  const events = await getAttendanceEvents();

  return <KehadiranPageClient initialEvents={events} />;
}
