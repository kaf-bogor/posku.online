export type KalenderKategori = 'event' | 'rutin' | 'insidential';

export type KalenderEvent = {
  name: string;
  category: KalenderKategori;
  start: string; // YYYY-MM-DD
  end?: string;
  pic?: string;
  support?: string;
  committee?: string;
  desc?: string;
  target?: string;
};

export type KalenderHoliday = {
  name: string;
  start: string;
  end?: string;
  note?: string;
};

export type KalenderOngoing = {
  name: string;
  cadence: string;
  desc?: string;
  pic?: string;
};

export type KalenderData = {
  title: string;
  subtitle?: string;
  range?: string;
  legend?: Record<string, string>;
  events: KalenderEvent[];
  holidays: KalenderHoliday[];
  ongoing_programs: KalenderOngoing[];
};

export function parseDateISO(value: string): Date {
  // parse YYYY-MM-DD sebagai lokal (hindari UTC shift)
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatTanggal(value: string): string {
  const d = parseDateISO(value);
  const month = d.toLocaleDateString('id-ID', { month: 'long' });
  return `${d.getDate()} ${month} ${d.getFullYear()}`;
}

export function formatTanggalSingkat(value: string): string {
  const d = parseDateISO(value);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatRentang(ev: KalenderEvent): string {
  if (!ev.end || ev.end === ev.start) return formatTanggal(ev.start);
  const s = parseDateISO(ev.start);
  const e = parseDateISO(ev.end);
  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()} – ${formatTanggal(ev.end)}`;
  }
  return `${formatTanggal(ev.start)} – ${formatTanggal(ev.end)}`;
}

export const KATEGORI_LABEL: Record<KalenderKategori, string> = {
  event: 'Event',
  rutin: 'Rutin',
  insidential: 'Insidental',
};

export const KATEGORI_COLOR: Record<KalenderKategori, string> = {
  event: 'purple',
  rutin: 'blue',
  insidential: 'teal',
};

/** event ber-tanggal yang masih akan datang / sedang berjalan (>= hari ini) */
export function upcomingEvents(
  events: KalenderEvent[],
  today: Date,
  limit?: number
): KalenderEvent[] {
  const t = startOfDay(today).getTime();
  const upcoming = events
    .filter((ev) => {
      const start = parseDateISO(ev.start).getTime();
      const end = ev.end ? parseDateISO(ev.end).getTime() : start;
      return end >= t;
    })
    .sort(
      (a, b) =>
        parseDateISO(a.start).getTime() - parseDateISO(b.start).getTime()
    );
  return limit ? upcoming.slice(0, limit) : upcoming;
}

/** Apakah program ini rutin (tiap pekan/bulan) atau belum dijadwalkan? selalu tampil */
export function isAlwaysOn(ongoing: KalenderOngoing): boolean {
  const c = ongoing.cadence.toLowerCase();
  return /setiap|tiap|rutin|mingguan|jadwal menyusul|menyusul|belum ditentukan|insidental/i.test(
    c
  );
}
