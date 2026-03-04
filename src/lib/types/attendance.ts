import type { Timestamp } from 'firebase/firestore';

// Firestore document shape (with Timestamps)
export interface AttendanceEventDoc {
  title: string;
  description: string;
  date: Timestamp;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt?: Timestamp;
}

// Serialised DTO (ISO strings instead of Timestamps)
export interface AttendanceEventDTO {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: string;
  createdBy: string;
}

// Firestore document shape
export interface AttendanceRecordDoc {
  eventId: string;
  userEmail: string;
  checkedInAt: Timestamp;
}

// Serialised DTO
export interface AttendanceRecordDTO {
  id: string;
  eventId: string;
  userEmail: string;
  checkedInAt: string;
}
