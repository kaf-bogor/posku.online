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

const VISITOR_KEY = 'posku_visitor_id';

function makeVisitorId(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 16; i += 1) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function getVisitorId(): string {
  try {
    let id = window.localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = makeVisitorId();
      window.localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return makeVisitorId();
  }
}

export interface OnlineUser {
  uid: string;
  email: string;
  name: string;
  lastSeen: number;
}

export interface OnlineStatus {
  users: OnlineUser[];
  anonymous: number;
}

export const getOnlineUsers = async (minutes = 5): Promise<OnlineStatus> => {
  try {
    const res = await fetch(
      `${D1_API_URL}/api/presence/online?minutes=${minutes}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return { users: [], anonymous: 0 };
    const data = (await res.json()) as {
      data?: OnlineUser[];
      anonymous?: number;
    };
    return { users: data.data ?? [], anonymous: data.anonymous ?? 0 };
  } catch {
    return { users: [], anonymous: 0 };
  }
};

export const presenceHeartbeat = async (): Promise<void> => {
  const token = await getToken();
  const path = token ? '/api/presence/heartbeat' : '/api/presence/anon';
  await fetch(`${D1_API_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: token ? undefined : JSON.stringify({ visitorId: getVisitorId() }),
  }).catch(() => {});
};

export const presenceLeave = async (): Promise<void> => {
  const token = await getToken();
  await fetch(`${D1_API_URL}/api/presence/leave`, {
    method: 'POST',
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : { 'Content-Type': 'application/json' },
    body: token ? undefined : JSON.stringify({ visitorId: getVisitorId() }),
  }).catch(() => {});
};
