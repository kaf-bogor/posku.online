import { toIntlDigits } from './phone';

const WA_HOST = 'wa.me';

/**
 * Normalize a phone-ish string into a wa.me href (digits only, country code 62).
 * Returns null when the input does not look like a phone number.
 */
export function phoneToWaHref(raw: string): string | null {
  const digits = toIntlDigits(raw);
  if (!digits) return null;
  // Valid Indonesian mobile: starts with 62 then 8 (628...), min 11 digits.
  if (!/^628\d{8,12}$/.test(digits)) return null;
  return `https://${WA_HOST}/${digits}`;
}

function waPathFromHref(href: string): string {
  return href.replace(`https://${WA_HOST}/`, '');
}

/** true ketika posisi ada di dalam link markdown (label atau url) yang sudah jadi */
function protectedRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const re = /\[[^\]]*\]\(\s*https?:\/\/[^)\s]+\)|https?:\/\/[^\s)]+/g;
  const matches = Array.from(text.matchAll(re));
  matches.forEach((m) => {
    const start = m.index ?? 0;
    ranges.push([start, start + m[0].length]);
  });
  return ranges;
}

/**
 * Convert bare Indonesian phone numbers found in `text` into markdown wa.me links.
 * Existing markdown links `[..](..)` and `http(s)://` URLs are left untouched.
 */
export function linkifyPhonesToWa(text: string): string {
  const PHONE_RE =
    /(?<![0-9A-Za-z])(\+?[\d][\d\s\-().]{6,20}[\d])(?![0-9A-Za-z])/g;
  const ranges = protectedRanges(text);
  const insideProtected = (i: number) =>
    ranges.some(([s, e]) => i >= s && i <= e);

  let out = '';
  let last = 0;

  const matches = Array.from(text.matchAll(PHONE_RE));
  matches.forEach((m) => {
    const token = m[0];
    const start = m.index ?? 0;
    if (insideProtected(start)) return;

    // avoid years/ranges like "2025/2026" or "2019/2020"
    const bareDigits = token.replace(/\D/g, '');
    if (/^(20\d{2}|19\d{2})$/.test(bareDigits)) return;

    const href = phoneToWaHref(token);
    if (!href) return;

    out += text.slice(last, start);
    out += `[${token.trim()}](https://${WA_HOST}/${waPathFromHref(href)})`;
    last = start + token.length;
  });
  out += text.slice(last);
  return out;
}

/**
 * Ensure any wa.me markdown link uses normalized digits-only href.
 * `[+62 899-0963-148](https://wa.me/+62 899-...)` -> `[+62 899-0963-148](https://wa.me/628990963148)`
 */
export function normalizeWaMeLinks(text: string): string {
  const LINK_RE = /\[([^\]]*)\]\(\s*https?:\/\/wa\.me\/[^)]*\)/g;
  return text.replace(LINK_RE, (whole, labelRaw: string) => {
    const label = labelRaw.trim();
    const href = phoneToWaHref(label);
    if (!href) return whole;
    return `[${label}](https://${WA_HOST}/${waPathFromHref(href)})`;
  });
}

/**
 * Full pipeline applied to an assistant answer before Markdown rendering.
 * 1) normalize already-present wa.me links, 2) linkify any remaining bare phones.
 */
export function prepareAssistantMarkdown(text: string): string {
  const normalized = normalizeWaMeLinks(text);
  return linkifyPhonesToWa(normalized);
}
