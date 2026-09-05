// Klien HTTP kelas/wakaf per kelas dari worker D1.
import { D1_API_URL } from '../config/d1';

import { getAdminToken } from './donationService';

export interface WakafParticipant {
  name: string;
  value: number;
  datetime: string;
}

export interface WakafActivity {
  userId: string;
  userName: string | null;
  type: string;
  description: string;
  datetime: string;
}

export interface WakafKelas {
  name: string;
  santriCount: number;
  target: number;
  collected: number;
  participants: WakafParticipant[];
  activities: WakafActivity[];
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
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAdminToken();
  if (!token) throw new Error('Anda harus login sebagai admin');
  return { Authorization: `Bearer ${token}` };
}

export const listWakafKelas = async (): Promise<WakafKelas[]> => {
  const res = await http<ListResponse<WakafKelas>>('/api/wakaf-kelas');
  return res?.data ?? [];
};

export const getWakafKelas = async (name: string): Promise<WakafKelas> =>
  http<WakafKelas>(`/api/wakaf-kelas/${encodeURIComponent(name)}`);

export const updateWakafKelasTarget = async (
  name: string,
  target: number
): Promise<WakafKelas> => {
  const headers = await authHeaders();
  return http<WakafKelas>(`/api/wakaf-kelas/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ target }),
  });
};

export const addWakafParticipant = async (
  name: string,
  participant: WakafParticipant
): Promise<WakafKelas> => {
  const headers = await authHeaders();
  return http<WakafKelas>(
    `/api/wakaf-kelas/${encodeURIComponent(name)}/participants`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(participant),
    }
  );
};

export const removeWakafParticipant = async (
  name: string,
  participant: WakafParticipant
): Promise<WakafKelas> => {
  const headers = await authHeaders();
  return http<WakafKelas>(
    `/api/wakaf-kelas/${encodeURIComponent(name)}/participants`,
    {
      method: 'DELETE',
      headers,
      body: JSON.stringify(participant),
    }
  );
};
