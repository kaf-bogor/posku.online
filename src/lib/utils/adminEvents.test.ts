import { describe, expect, it } from 'vitest';

import type { EventItem } from '~/lib/types/event';

import { filterEvents, getEventStatus } from './adminEvents';

const MIN = 60 * 1000;

function makeEvent(
  overrides: Partial<EventItem> & { startDate: string; endDate: string }
): EventItem {
  return {
    id: 'e1',
    title: 'Kajian Bulanan',
    slug: 'kajian-bulanan',
    summary: '',
    imageUrls: [],
    location: 'Masjid AURI',
    isActive: true,
    ...overrides,
  };
}

describe('adminEvents#getEventStatus', () => {
  it('menandai acara non-aktif sebagai disembunyikan', () => {
    const ev = makeEvent({
      isActive: false,
      startDate: new Date(Date.now() + 10 * MIN).toISOString(),
      endDate: new Date(Date.now() + 20 * MIN).toISOString(),
    });
    expect(getEventStatus(ev)).toEqual({
      label: 'Disembunyikan',
      color: 'gray',
    });
  });

  it('menandai acara aktif yang belum mulai sebagai akan datang', () => {
    const ev = makeEvent({
      startDate: new Date(Date.now() + 10 * MIN).toISOString(),
      endDate: new Date(Date.now() + 20 * MIN).toISOString(),
    });
    expect(getEventStatus(ev)).toEqual({ label: 'Akan datang', color: 'blue' });
  });

  it('menandai acara yang sudah berakhir sebagai selesai', () => {
    const ev = makeEvent({
      startDate: new Date(Date.now() - 20 * MIN).toISOString(),
      endDate: new Date(Date.now() - 10 * MIN).toISOString(),
    });
    expect(getEventStatus(ev)).toEqual({ label: 'Selesai', color: 'orange' });
  });

  it('menandai acara yang sedang berlangsung', () => {
    const ev = makeEvent({
      startDate: new Date(Date.now() - 10 * MIN).toISOString(),
      endDate: new Date(Date.now() + 10 * MIN).toISOString(),
    });
    expect(getEventStatus(ev)).toEqual({
      label: 'Berlangsung',
      color: 'green',
    });
  });
});

describe('adminEvents#filterEvents', () => {
  const events: EventItem[] = [
    makeEvent({
      id: 'upcoming',
      title: 'Kajian Rutin',
      location: 'Masjid AURI',
      startDate: new Date(Date.now() + 2 * 24 * 60 * MIN).toISOString(),
      endDate: new Date(
        Date.now() + 2 * 24 * 60 * MIN + 60 * MIN
      ).toISOString(),
    }),
    makeEvent({
      id: 'ongoing',
      title: 'Daurah Quran',
      location: 'Kuttab',
      startDate: new Date(Date.now() - 30 * MIN).toISOString(),
      endDate: new Date(Date.now() + 30 * MIN).toISOString(),
    }),
    makeEvent({
      id: 'past',
      title: 'Pekan Ukhuwah',
      location: 'Lapangan',
      startDate: new Date(Date.now() - 3 * 24 * 60 * MIN).toISOString(),
      endDate: new Date(Date.now() - 2 * 24 * 60 * MIN).toISOString(),
    }),
    makeEvent({
      id: 'hidden',
      title: 'Event Lama',
      location: 'Aula',
      isActive: false,
      startDate: new Date(Date.now() + 5 * MIN).toISOString(),
      endDate: new Date(Date.now() + 6 * MIN).toISOString(),
    }),
  ];

  it('tidak memfilter apapun saat query kosong & status all', () => {
    const result = filterEvents(events, '', 'all');
    expect(result.map((e) => e.id)).toEqual([
      'upcoming',
      'ongoing',
      'past',
      'hidden',
    ]);
  });

  it('mencari berdasarkan judul (case-insensitive)', () => {
    const result = filterEvents(events, 'DAURAH', 'all');
    expect(result.map((e) => e.id)).toEqual(['ongoing']);
  });

  it('mencari berdasarkan lokasi', () => {
    const result = filterEvents(events, 'aula', 'all');
    expect(result.map((e) => e.id)).toEqual(['hidden']);
  });

  it('filter status upcoming', () => {
    const result = filterEvents(events, '', 'upcoming');
    expect(result.map((e) => e.id)).toEqual(['upcoming']);
  });

  it('filter status active (berlangsung)', () => {
    const result = filterEvents(events, '', 'active');
    expect(result.map((e) => e.id)).toEqual(['ongoing']);
  });

  it('filter status past', () => {
    const result = filterEvents(events, '', 'past');
    expect(result.map((e) => e.id)).toEqual(['past']);
  });

  it('filter status hidden (non-aktif)', () => {
    const result = filterEvents(events, '', 'hidden');
    expect(result.map((e) => e.id)).toEqual(['hidden']);
  });

  it('menggabungkan query dan filter status', () => {
    const result = filterEvents(events, 'event', 'hidden');
    expect(result.map((e) => e.id)).toEqual(['hidden']);
  });

  it('mengembalikan kosong bila tidak ada yang cocok', () => {
    expect(filterEvents(events, 'xyz-tidak-ada', 'all')).toEqual([]);
  });
});
