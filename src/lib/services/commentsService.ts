// Klien HTTP komentar dari worker D1.
import { D1_API_URL } from '../config/d1';
import type { CommentItem } from '~/lib/types/comment';

async function getToken(): Promise<string | null> {
  try {
    const { getAuth } = await import('firebase/auth');
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  } catch {
    return null;
  }
}

export const listComments = async (
  resourceType: string,
  resourceId: string
): Promise<CommentItem[]> => {
  try {
    const res = await fetch(
      `${D1_API_URL}/api/comments?resourceType=${encodeURIComponent(
        resourceType
      )}&resourceId=${encodeURIComponent(resourceId)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: CommentItem[] };
    return data.data ?? [];
  } catch {
    return [];
  }
};

export const addComment = async (input: {
  resourceType: string;
  resourceId: string;
  userPhotoURL?: string;
  comment: string;
}): Promise<void> => {
  const token = await getToken();
  if (!token) throw new Error('Anda perlu login untuk berkomentar.');

  const res = await fetch(`${D1_API_URL}/api/comments`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
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
};
