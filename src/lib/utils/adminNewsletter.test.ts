/* eslint-disable sonarjs/no-duplicate-string */
import { describe, expect, it } from 'vitest';

import {
  filterNewsletters,
  isNewsletterPublished,
  monthToOrder,
  monthToTitle,
  parseNewsletterMonth,
  sortNewslettersByDateDesc,
} from './adminNewsletter';

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
  const Y24 = '2024';
  const items = [
    { id: '1', title: `Juli ${Y24}` },
    { id: '2', title: `Agustus ${Y24}` },
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

describe('adminNewsletter#bulan', () => {
  const T24 = 2024;
  const T25 = 2025;
  it('parseNewsletterMonth membaca bulan & tahun dari judul', () => {
    expect(parseNewsletterMonth('Juli 2024')).toEqual({ month: 7, year: T24 });
    expect(parseNewsletterMonth('Agustus 2025')).toEqual({
      month: 8,
      year: 2025,
    });
    expect(parseNewsletterMonth('Tanpa bulan')).toBeNull();
  });

  it('monthToTitle menghasilkan judul Indonesia', () => {
    expect(monthToTitle(1, 2025)).toBe('Januari 2025');
    expect(monthToTitle(12, 2024)).toBe('Desember 2024');
  });

  it('monthToOrder naik seiring bulan/tahun (lebih baru lebih besar)', () => {
    expect(monthToOrder(1, T24)).toBeLessThan(monthToOrder(12, T24));
    expect(monthToOrder(12, T24)).toBeLessThan(monthToOrder(1, T25));
  });

  it('sortNewslettersByDateDesc mengurutkan terbaru dulu', () => {
    const list = [
      { title: `Juli ${T24}` },
      { title: `Januari ${T25}` },
      { title: `September ${T24}` },
    ];
    expect(sortNewslettersByDateDesc(list).map((i) => i.title)).toEqual([
      'Januari 2025',
      'September 2024',
      'Juli 2024',
    ]);
  });
});
