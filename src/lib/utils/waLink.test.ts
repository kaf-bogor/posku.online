import { describe, expect, it } from 'vitest';

import {
  linkifyPhonesToWa,
  normalizeWaMeLinks,
  phoneToWaHref,
  prepareAssistantMarkdown,
} from './waLink';

const WA_N1 = 'https://wa.me/628990963148';
const WA_N2 = 'https://wa.me/6285735583617';

describe('phoneToWaHref', () => {
  it('konversi 08 menjadi 628', () => {
    expect(phoneToWaHref('0812-3456-7890')).toBe('https://wa.me/6281234567890');
  });

  it('konversi +62 (buang plus/spasi/hyphen)', () => {
    expect(phoneToWaHref('+62 899-0963-148')).toBe(WA_N1);
  });

  it('nomor tanpa format (628...) tetap valid', () => {
    expect(phoneToWaHref('628990963148')).toBe(WA_N1);
  });

  it('bukan nomor -> null', () => {
    expect(phoneToWaHref('0821')).toBeNull();
    expect(phoneToWaHref('abc')).toBeNull();
    expect(phoneToWaHref('')).toBeNull();
  });
});

describe('linkifyPhonesToWa', () => {
  it('ubah nomor 08 jadi link wa.me', () => {
    const out = linkifyPhonesToWa('Kontak: 0899-0963-148');
    expect(out).toBe(`Kontak: [0899-0963-148](${WA_N1})`);
  });

  it('ubah nomor +62 dengan spasi/hyphen', () => {
    const out = linkifyPhonesToWa('WA: +62 857-3558-3617');
    expect(out).toBe(`WA: [+62 857-3558-3617](${WA_N2})`);
  });

  it('dukung banyak nomor dalam satu respons', () => {
    const out = linkifyPhonesToWa('A: +62 899-0963-148\nB: 0857-3558-3617');
    expect(out).toContain(WA_N1);
    expect(out).toContain(WA_N2);
    expect(out.match(/wa\.me\//g)?.length).toBe(2);
  });

  it('tahun ajaran tidak diubah jadi link', () => {
    const out = linkifyPhonesToWa('Tahun ajaran: 2025/2026');
    expect(out).toBe('Tahun ajaran: 2025/2026');
  });

  it('link wa.me yang sudah ada tidak digandakan', () => {
    const md = `WA: [+62 899-0963-148](${WA_N1})`;
    const out = linkifyPhonesToWa(md);
    expect(out.match(/wa\.me\//g)?.length).toBe(1);
  });
});

describe('normalizeWaMeLinks', () => {
  it('normalisasi url yang kotor', () => {
    const md = '[+62 899-0963-148](https://wa.me/+62 899-0963-148)';
    expect(normalizeWaMeLinks(md)).toBe(`[+62 899-0963-148](${WA_N1})`);
  });

  it('respons tanpa nomor tidak berubah', () => {
    const md = 'Tidak ada kontak.';
    expect(normalizeWaMeLinks(md)).toBe(md);
  });
});

describe('prepareAssistantMarkdown', () => {
  it('gabungan: label tetap terbaca, url bersih & tunggal', () => {
    const md = 'Guru: +62 899-0963-148';
    const out = prepareAssistantMarkdown(md);
    expect(out).toBe(`Guru: [+62 899-0963-148](${WA_N1})`);
    expect(out.match(/wa\.me\//g)?.length).toBe(1);
  });
});
