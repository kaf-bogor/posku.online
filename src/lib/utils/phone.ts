/**
 * Normalize an Indonesian phone number to E.164-ish digits (no "+").
 * Examples:
 *   "081234567890" -> "6281234567890"
 *   "+62 857-1612-9641" -> "6285716129641"
 */
export function toIntlDigits(raw: string | null | undefined): string {
  const digits = (raw || '').replace(/[^\d+]/g, '');
  if (!digits) return '';
  const withoutPlus = digits.replace(/^\+/, '');
  if (withoutPlus.startsWith('0')) return `62${withoutPlus.slice(1)}`;
  if (withoutPlus.startsWith('62')) return withoutPlus;
  return withoutPlus;
}
