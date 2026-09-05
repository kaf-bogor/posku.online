import { storageUrl } from '~/lib/context/baseUrl';

export function resolveStorageUrl(value: string | null | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (/^https?:\/\//.test(trimmed)) return trimmed;
  return `${storageUrl}/${trimmed}`;
}
