import { describe, expect, it } from 'vitest';

import { filterNewsletters, isNewsletterPublished } from './adminNewsletter';

describe('adminNewsletter#isNewsletterPublished', () => {
  it('true bila document_url terisi', () => {
    expect(
      isNewsletterPublished({ title: 'A', document_url: 'https://bit.ly/x' })
    ).toBe(true);
  });

  it('false bila document_url null, kosong, atau undefined', () => {
    expect(isNewsletterPublished({ title: 'A', document_url: null })).toBe(
      false
    );
    expect(isNewsletterPublished({ title: 'A', document_url: '' })).toBe(false);
    expect(isNewsletterPublished({ title: 'A' })).toBe(false);
  });
});

describe('adminNewsletter#filterNewsletters', () => {
  const items = [
    { id: '1', title: 'Juli 2024' },
    { id: '2', title: 'Agustus 2024' },
    { id: '3', title: 'Januari 2025' },
  ];

  it('mengembalikan semua saat query kosong', () => {
    expect(filterNewsletters(items, '')).toHaveLength(3);
    expect(filterNewsletters(items, '   ')).toHaveLength(3);
  });

  it('memfilter berdasarkan judul case-insensitive', () => {
    expect(filterNewsletters(items, 'agustus').map((i) => i.id)).toEqual(['2']);
    expect(filterNewsletters(items, '2024')).toHaveLength(2);
  });

  it('memfilter sebagian kata', () => {
    expect(filterNewsletters(items, 'januari').map((i) => i.id)).toEqual(['3']);
  });

  it('mengembalikan kosong bila tidak cocok', () => {
    expect(filterNewsletters(items, 'tidak-ada')).toEqual([]);
  });
});
