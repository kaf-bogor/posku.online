import { describe, expect, it } from 'vitest';

import { formatIDR } from './currency';

describe('formatIDR', () => {
  it('memformat angka rupiah tanpa desimal', () => {
    expect(formatIDR(1250000)).toBe('Rp 1.250.000');
  });

  it('memformat nol', () => {
    expect(formatIDR(0)).toBe('Rp 0');
  });

  it('default undefined menjadi 0', () => {
    expect(formatIDR(undefined)).toBe('Rp 0');
  });

  it('menangani nilai besar', () => {
    expect(formatIDR(6746220000)).toBe('Rp 6.746.220.000');
  });
});
