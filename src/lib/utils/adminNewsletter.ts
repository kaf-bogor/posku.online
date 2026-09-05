export interface NewsletterListable {
  title: string;
  document_url?: string | null;
}

export function isNewsletterPublished(item: NewsletterListable): boolean {
  return Boolean(item.document_url);
}

export function filterNewsletters<T extends NewsletterListable>(
  items: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => item.title.toLowerCase().includes(q));
}

export const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export interface MonthRef {
  month: number; // 1..12
  year: number;
}

export function parseNewsletterMonth(title: string): MonthRef | null {
  const monthIdx = MONTHS_ID.findIndex((m) =>
    title.toLowerCase().includes(m.toLowerCase())
  );
  if (monthIdx === -1) return null;
  const yearMatch = title.match(/(?:^|\s)(20\d{2})(?:\s|$)/);
  if (!yearMatch) return null;
  return { month: monthIdx + 1, year: Number(yearMatch[1]) };
}

export function monthToTitle(month: number, year: number): string {
  return `${MONTHS_ID[month - 1]} ${year}`;
}

export function monthToOrder(month: number, year: number): number {
  return year * 12 + (month - 1);
}

function itemDateKey(item: NewsletterListable): number {
  const parsed = parseNewsletterMonth(item.title);
  if (parsed) return parsed.year * 12 + (parsed.month - 1);
  return 0;
}

/** Urutkan newsletter dari bulan/tahun terbaru ke terlama. */
export function sortNewslettersByDateDesc<T extends NewsletterListable>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => itemDateKey(b) - itemDateKey(a));
}
