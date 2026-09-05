export const MENU_HREF = {
  tentang: '/tentang',
  muslimah_center: '/muslimah_center',
  pengurus: '/pengurus',
  kalender: '/kalender_posku',
  newsletter: '/newsletter',
  quiz: '/quiz',
  kehadiran: '/kehadiran',
} as const;

export interface HomeMenuLink {
  label: string;
  href: string;
}

export const HOME_MENU: HomeMenuLink[] = [
  { label: 'Tentang POSKU', href: MENU_HREF.tentang },
  { label: 'Muslimah Center', href: MENU_HREF.muslimah_center },
  { label: 'Pengurus', href: MENU_HREF.pengurus },
  { label: 'Kalender POSKU', href: MENU_HREF.kalender },
  { label: 'Newsletter', href: MENU_HREF.newsletter },
  { label: 'Quiz', href: MENU_HREF.quiz },
  { label: 'Kehadiran', href: MENU_HREF.kehadiran },
];

export type DetailBase = '/news' | '/events' | '/amal';

export const DETAIL_BASES: DetailBase[] = ['/news', '/events', '/amal'];

/** Bangun path detail (mis. /news/slug) tanpa mengubah slug. */
export function contentDetailHref(base: DetailBase, slugOrId: string): string {
  return `${base}/${slugOrId}`;
}
