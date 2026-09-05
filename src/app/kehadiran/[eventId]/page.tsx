import { getAttendanceEvent } from '~/lib/services/attendanceService';
import type { AttendanceEventDTO } from '~/lib/types/attendance';

import KehadiranEventDetailClient from './components/KehadiranEventDetailClient';

async function getEvent(eventId: string): Promise<AttendanceEventDTO | null> {
  return getAttendanceEvent(eventId);
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
