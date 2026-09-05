// Klien HTTP kehadiran/attendance dari worker D1.
import { D1_API_URL } from '../config/d1';
import type {
  AttendanceEventDTO,
  AttendanceRecordDTO,
} from '~/lib/types/attendance';

async function getToken(): Promise<string | null> {
  try {
    const { getAuth } = await import('firebase/auth');
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  } catch {
    return null;
  }
}

interface ListResponse<T> {
  data: T[];
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${D1_API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string; message?: string };
      if (data.error) message = data.error;
      else if (data.message) message = data.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

// ---------- publik (tanpa token) ----------
export const listAttendanceEvents = async (): Promise<AttendanceEventDTO[]> => {
  try {
    const res = await http<ListResponse<AttendanceEventDTO>>(
      '/api/attendance/events'
    );
    return res.data ?? [];
  } catch {
    return [];
  }
};

export const getAttendanceEvent = async (
  id: string
): Promise<AttendanceEventDTO | null> => {
  try {
    return await http<AttendanceEventDTO>(
      `/api/attendance/events/${encodeURIComponent(id)}`
    );
  } catch {
    return null;
  }
};

export const listAttendanceRecords = async (
  eventId: string
): Promise<AttendanceRecordDTO[]> => {
  try {
    const res = await http<ListResponse<AttendanceRecordDTO>>(
      `/api/attendance/events/${encodeURIComponent(eventId)}/records`
    );
    return res.data ?? [];
  } catch {
    return [];
  }
};

// ---------- check-in (user login) ----------
export interface CheckInResult {
  created: boolean;
  message: string;
}

export const checkInAttendance = async (
  eventId: string,
  userEmail: string
): Promise<CheckInResult> => {
  const token = await getToken();
  if (!token) throw new Error('Anda perlu login untuk check-in.');

  const res = await fetch(
    `${D1_API_URL}/api/attendance/events/${encodeURIComponent(eventId)}/checkin`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userEmail }),
    }
  );
  const data = (await res.json().catch(() => ({}))) as { message?: string };

  if (res.status === 201)
    return { created: true, message: data.message || 'Check-in berhasil!' };
  if (res.status === 409)
    return { created: false, message: data.message || 'Anda sudah check-in.' };
  throw new Error(data.message || `HTTP ${res.status}`);
};

// ---------- admin ----------
const AUTH_ERROR = 'Anda harus login sebagai admin';

async function adminHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  if (!token) throw new Error(AUTH_ERROR);
  return { Authorization: `Bearer ${token}` };
}

export const createAttendanceEvent = async (input: {
  title: string;
  description: string;
  date: string;
}): Promise<AttendanceEventDTO> => {
  const headers = await adminHeaders();
  return http<AttendanceEventDTO>('/api/attendance/events', {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });
};

export const updateAttendanceEvent = async (
  id: string,
  input: { title: string; description: string; date: string }
): Promise<AttendanceEventDTO> => {
  const headers = await adminHeaders();
  return http<AttendanceEventDTO>(
    `/api/attendance/events/${encodeURIComponent(id)}`,
    { method: 'PUT', headers, body: JSON.stringify(input) }
  );
};

export const deleteAttendanceEvent = async (id: string): Promise<void> => {
  const headers = await adminHeaders();
  await fetch(`${D1_API_URL}/api/attendance/events/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  });
};
