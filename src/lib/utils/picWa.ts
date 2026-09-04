import rawWaliData from '~/lib/data/data_wali_santri.json';
import type { DataWaliSantriRecord } from '~/lib/types/data_wali_santri';

import { toIntlDigits } from './phone';

const wali = rawWaliData as DataWaliSantriRecord[];

type PicMatch = { label: string; waHref: string | null };

function norm(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value: string): string[] {
  return norm(value)
    .split(' ')
    .filter((t) => t.length > 1);
}

function stripTitle(segment: string): string {
  return segment
    .replace(/^(pak|bapak|bu|ibu|ustadz|ustadzah|ust|kang)\s+/i, '')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s*ketua.*/i, ' ')
    .trim();
}

/** Cocokkan segmen nama PIC ke wali santri; kembalikan link wa bila ketemu. */
function matchWali(segment: string): PicMatch {
  const clean = stripTitle(segment);
  const segTokens = tokens(clean);
  const label = clean || segment.trim();
  if (segTokens.length === 0) return { label, waHref: null };

  const allIn = (needle: string[], hay: string[]) =>
    needle.length > 0 && needle.every((t) => hay.includes(t));

  const found = wali
    .map((w) => {
      const ayahTokens = norm(w.nama_ayah || '')
        .split(' ')
        .filter(Boolean);
      const ibuTokens = norm(w.nama_ibu || '')
        .split(' ')
        .filter(Boolean);
      let phone = '';
      if (allIn(segTokens, ayahTokens)) phone = toIntlDigits(w.no_hp_ayah);
      else if (allIn(segTokens, ibuTokens)) phone = toIntlDigits(w.no_hp_ibu);
      return phone;
    })
    .find((phone) => phone && /^628\d{8,12}$/.test(phone));

  if (found) return { label, waHref: `https://wa.me/${found}` };
  return { label, waHref: null };
}

/**
 * Pecah string PIC (mis. "Pak Febri", "Ibu Leni Melvita & Ibu Lela")
 * menjadi segmen; segmen yang cocok dengan walisantri jadi link WhatsApp.
 */
export function resolvePicToWa(pic: string): PicMatch[] {
  const raw = pic || '';
  if (!raw.trim() || raw === '—') return [];

  return raw
    .split(/[&,]+| dan /i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(matchWali);
}
