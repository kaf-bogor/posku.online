// Klien HTTP untuk API donations di worker D1 (posku-d1).
// Memakai D1_API_URL dari src/lib/config/d1.ts.
// Tidak mengimpor firebase di top-level agar aman dipakai dari Server Component
// (/amal/[id]); token Firebase diambil lazy hanya saat dibutuhkan (admin).
import { D1_API_URL } from '../config/d1';
import type { DonationPage } from '~/lib/types/donation';

async function request<T>(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const res = await fetch(`${D1_API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore body parse error
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

// Token Firebase pengguna yang sedang login (untuk operasi admin).
export async function getAdminToken(): Promise<string | null> {
  try {
    const { getAuth } = await import('firebase/auth');
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  } catch {
    return null;
  }
}

export interface ListDonationsParams {
  active?: boolean;
}

export const listDonations = async (
  params?: ListDonationsParams
): Promise<DonationPage[]> => {
  const q =
    params?.active === undefined ? '' : `?active=${params.active ? 1 : 0}`;
  const data = await request<{ data: DonationPage[] }>(`/api/donations${q}`);
  return data.data ?? [];
};

export const getDonation = async (
  idOrSlug: string
): Promise<DonationPage | null> => {
  try {
    return await request<DonationPage>(
      `/api/donations/${encodeURIComponent(idOrSlug)}`
    );
  } catch {
    return null;
  }
};

export const createDonation = async (
  token: string,
  payload: Partial<DonationPage>
): Promise<DonationPage> =>
  request<DonationPage>('/api/donations', {
    method: 'POST',
    token,
    body: payload,
  });

export const updateDonation = async (
  token: string,
  id: string,
  payload: Partial<DonationPage>
): Promise<DonationPage> =>
  request<DonationPage>(`/api/donations/${encodeURIComponent(id)}`, {
    method: 'PUT',
    token,
    body: payload,
  });

export const deleteDonation = async (
  token: string,
  id: string
): Promise<void> => {
  await request<{ ok: boolean }>(`/api/donations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
  });
};

export const setDonors = async (
  token: string,
  id: string,
  donors: DonationPage['donors']
): Promise<{ donors: DonationPage['donors']; donorsCount: number }> =>
  request<{ donors: DonationPage['donors']; donorsCount: number }>(
    `/api/donations/${encodeURIComponent(id)}/donors`,
    { method: 'POST', token, body: { donors } }
  );

export const reorderDonations = async (
  token: string,
  orders: Array<{ id: string; order: number }>
): Promise<void> => {
  await request<{ ok: boolean }>('/api/donations/reorder', {
    method: 'POST',
    token,
    body: { orders },
  });
};
