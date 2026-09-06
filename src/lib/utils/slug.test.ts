import { describe, expect, it } from 'vitest';

import { generateSlug } from './slug';

describe('generateSlug', () => {
  it('menghilangkan diakritik', () => {
    expect(generateSlug('Kajian Qur’an Siroh')).toBe('kajian-quran-siroh');
  });

  it('huruf kecil & spasi jadi strip', () => {
    expect(generateSlug('Pekan Ukhuwah 2025')).toBe('pekan-ukhuwah-2025');
  });

  it('karakter khusus dibuang', () => {
    expect(generateSlug('Wakaf!? @Kelas')).toBe('wakaf-kelas');
  });

  it('strip ganda dilipat & tepi dirapikan', () => {
    expect(generateSlug('--KBO--   Agustus--')).toBe('kbo-agustus');
  });
});
