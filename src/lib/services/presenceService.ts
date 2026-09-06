// Klien HTTP presence "sedang online" dari worker D1.
import { D1_API_URL } from '../config/d1';

async function getToken(): Promise<string | null> {
  try {
    const { getAuth } = await import('firebase/auth');
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  } catch {
    return null;
  }
}

export interface OnlineUser {
  uid: string;
  email: string;
  name: string;
  lastSeen: number;
}

export const getOnlineUsers = async (minutes = 5): Promise<OnlineUser[]> => {
  try {
    const res = await fetch(
      `${D1_API_URL}/api/presence/online?minutes=${minutes}`,
      {
        headers: { Accept: 'application/json' },
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: OnlineUser[] };
    return data.data ?? [];
  } catch {
    return [];
  }
};

export const presenceHeartbeat = async (): Promise<void> => {
  const token = await getToken();
  if (!token) return;
  await fetch(`${D1_API_URL}/api/presence/heartbeat`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
};

export const presenceLeave = async (): Promise<void> => {
  const token = await getToken();
  if (!token) return;
  await fetch(`${D1_API_URL}/api/presence/leave`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
};
