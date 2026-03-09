export function generateSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics (é → e, etc.)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove remaining special characters
    .replace(/[\s_]+/g, '-') // spaces/underscores → hyphens
    .replace(/-+/g, '-') // collapse consecutive hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}
