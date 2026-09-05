// Klien HTTP konten (news/events/podcasts) dari worker D1 — public read + admin write.
import { D1_API_URL } from '../config/d1';
import type { EventItem } from '~/lib/types/event';
import type { NewsItem } from '~/lib/types/news';

import { getAdminToken } from './donationService';

const AUTH_ERROR = 'Anda harus login sebagai admin';

async function request<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${D1_API_URL}${path}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function mutate<T>(
  path: string,
  method: 'POST' | 'PUT',
  token: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${D1_API_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
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

interface ListResponse<T> {
  data: T[];
}

// ---------- baca publik ----------
export const listNews = async (): Promise<NewsItem[]> => {
  const res = await request<ListResponse<NewsItem>>('/api/news');
  return res?.data ?? [];
};

export const getNews = async (slugOrId: string): Promise<NewsItem | null> =>
  request<NewsItem>(`/api/news/${encodeURIComponent(slugOrId)}`);

export const listEvents = async (): Promise<EventItem[]> => {
  const res = await request<ListResponse<EventItem>>('/api/events');
  return res?.data ?? [];
};

export const getEvent = async (slugOrId: string): Promise<EventItem | null> =>
  request<EventItem>(`/api/events/${encodeURIComponent(slugOrId)}`);

export interface PodcastItem {
  id: string;
  title: string;
  description: string;
  url: string;
  summary: string;
  imageUrls: string[];
}

export const listPodcasts = async (): Promise<PodcastItem[]> => {
  const res = await request<ListResponse<PodcastItem>>('/api/podcasts');
  return res?.data ?? [];
};

export interface NewsletterRecord {
  id?: string;
  order: number;
  title: string;
  image_url: string;
  document_url: string | null;
}

export const listNewsletters = async (): Promise<NewsletterRecord[]> => {
  const res = await request<ListResponse<NewsletterRecord>>('/api/newsletters');
  return res?.data ?? [];
};

export const createNewsletter = async (
  payload: Omit<NewsletterRecord, 'id'>
): Promise<NewsletterRecord> => {
  const token = await getAdminToken();
  if (!token) throw new Error(AUTH_ERROR);
  return mutate<NewsletterRecord>('/api/newsletters', 'POST', token, payload);
};

export const updateNewsletter = async (
  id: string,
  payload: Omit<NewsletterRecord, 'id'>
): Promise<NewsletterRecord> => {
  const token = await getAdminToken();
  if (!token) throw new Error(AUTH_ERROR);
  return mutate<NewsletterRecord>(
    `/api/newsletters/${encodeURIComponent(id)}`,
    'PUT',
    token,
    payload
  );
};

export const deleteNewsletter = async (id: string): Promise<void> => {
  const token = await getAdminToken();
  if (!token) throw new Error(AUTH_ERROR);
  const res = await fetch(
    `${D1_API_URL}/api/newsletters/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
};

// ---------- tulis admin ----------
export const createNews = async (
  payload: Partial<NewsItem>
): Promise<NewsItem> => {
  const token = await getAdminToken();
  if (!token) throw new Error(AUTH_ERROR);
  return mutate<NewsItem>('/api/news', 'POST', token, payload);
};

export const updateNews = async (
  id: string,
  payload: Partial<NewsItem>
): Promise<NewsItem> => {
  const token = await getAdminToken();
  if (!token) throw new Error(AUTH_ERROR);
  return mutate<NewsItem>(
    `/api/news/${encodeURIComponent(id)}`,
    'PUT',
    token,
    payload
  );
};

export const createEvent = async (
  payload: Partial<EventItem>
): Promise<EventItem> => {
  const token = await getAdminToken();
  if (!token) throw new Error(AUTH_ERROR);
  return mutate<EventItem>('/api/events', 'POST', token, payload);
};

export const updateEvent = async (
  id: string,
  payload: Partial<EventItem>
): Promise<EventItem> => {
  const token = await getAdminToken();
  if (!token) throw new Error(AUTH_ERROR);
  return mutate<EventItem>(
    `/api/events/${encodeURIComponent(id)}`,
    'PUT',
    token,
    payload
  );
};
