import { describe, expect, it } from 'vitest';

import { resolveStorageUrl } from './newsletter';

describe('resolveStorageUrl', () => {
  it('kembalikan kosong untuk nilai kosong/null', () => {
    expect(resolveStorageUrl('')).toBe('');
    expect(resolveStorageUrl(null)).toBe('');
    expect(resolveStorageUrl(undefined)).toBe('');
  });

  it('mempertahankan URL lengkap', () => {
    const url = 'https://files.rifkifauzi.id/x.png';
    expect(resolveStorageUrl(url)).toBe(url);
  });

  it('menambahkan storageUrl untuk path relatif', () => {
    expect(resolveStorageUrl('2024/juli/juli_thumb.png')).toBe(
      'https://files.rifkifauzi.id/2024/juli/juli_thumb.png'
    );
  });

  it('memangkas spasi di tepi', () => {
    expect(resolveStorageUrl(' 2024/a.png ')).toBe(
      'https://files.rifkifauzi.id/2024/a.png'
    );
  });
});
