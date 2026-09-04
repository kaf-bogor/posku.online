import type {
  AttendanceEventDTO,
  AttendanceRecordDTO,
} from '~/lib/types/attendance';

type TimestampLike = { toDate: () => Date };

export function toIso(ts?: TimestampLike | null): string {
  return ts ? ts.toDate().toISOString() : new Date(0).toISOString();
}

export function mapAttendanceEvent(
  id: string,
  data?: {
    title?: string;
    description?: string;
    date?: TimestampLike;
    createdAt?: TimestampLike;
    createdBy?: string;
  } | null
): AttendanceEventDTO {
  return {
    id,
    title: data?.title ?? '',
    description: data?.description ?? '',
    date: toIso(data?.date),
    createdAt: toIso(data?.createdAt),
    createdBy: data?.createdBy ?? '',
  };
}

export function mapAttendanceRecord(
  id: string,
  data:
    | {
        eventId?: string;
        userEmail?: string;
        checkedInAt?: TimestampLike;
      }
    | null
    | undefined,
  fallbackEventId: string
): AttendanceRecordDTO {
  return {
    id,
    eventId: data?.eventId ?? fallbackEventId,
    userEmail: data?.userEmail ?? '',
    checkedInAt: toIso(data?.checkedInAt),
  };
}
