// Base URL Worker pembaca D1 (bisa dioverride via NEXT_PUBLIC_D1_API_URL)
export const D1_API_URL =
  process.env.NEXT_PUBLIC_D1_API_URL || 'https://posku-d1.kubido.workers.dev';

export async function fetchJson<T>(path: string): Promise<T | null> {
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
