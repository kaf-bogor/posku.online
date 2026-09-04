import { doc, getDoc } from 'firebase/firestore';

import { db } from '~/lib/firebase';
import type { AttendanceEventDTO } from '~/lib/types/attendance';
import { mapAttendanceEvent } from '~/lib/utils/attendance';

import KehadiranEventDetailClient from './components/KehadiranEventDetailClient';

async function getEvent(eventId: string): Promise<AttendanceEventDTO | null> {
  const snap = await getDoc(doc(db, 'attendanceEvents', eventId));
  if (!snap.exists()) return null;

  return mapAttendanceEvent(snap.id, snap.data());
}

export default async function KehadiranEventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const event = await getEvent(eventId);

  return <KehadiranEventDetailClient event={event} eventId={eventId} />;
}
