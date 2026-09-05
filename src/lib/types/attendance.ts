// Serialised DTO (ISO strings)
export interface AttendanceEventDTO {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: string;
  createdBy: string;
}

// Serialised DTO
export interface AttendanceRecordDTO {
  id: string;
  eventId: string;
  userEmail: string;
  checkedInAt: string;
}
