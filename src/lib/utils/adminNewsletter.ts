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
