import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  contentDetailHref,
  DETAIL_BASES,
  HOME_MENU,
  MENU_HREF,
} from './homeLinks';

const APP_DIR = path.join(process.cwd(), 'src', 'app');

function routeExists(href: string): boolean {
  const segments = href.split('/').filter(Boolean);
  const dir = path.join(APP_DIR, ...segments);
  return (
    existsSync(path.join(dir, 'page.tsx')) ||
    existsSync(path.join(dir, 'page', 'page.tsx'))
  );
}

describe('homeLinks#HOME_MENU', () => {
  it('memiliki label & href unik', () => {
    const labels = HOME_MENU.map((l) => l.label);
    const hrefs = HOME_MENU.map((l) => l.href);
    expect(new Set(labels).size).toBe(labels.length);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('semua href diawali "/" dan merujuk rute yang ada', () => {
    HOME_MENU.forEach((link) => {
      expect(link.href.startsWith('/')).toBe(true);
      expect(routeExists(link.href)).toBe(true);
    });
  });

  it('HOME_MENU konsisten dengan MENU_HREF', () => {
    const fromMap = Object.values(MENU_HREF);
    expect(HOME_MENU.map((l) => l.href).sort()).toEqual(fromMap.sort());
  });

  it('MENU_HREF berisi rute halaman yang valid', () => {
    Object.values(MENU_HREF).forEach((href) => {
      expect(routeExists(href)).toBe(true);
    });
  });
});

describe('homeLinks#contentDetailHref', () => {
  it('menggabungkan base dan slug', () => {
    expect(contentDetailHref('/news', 'kajian-bulanan')).toBe(
      '/news/kajian-bulanan'
    );
    expect(contentDetailHref('/events', 'pekan-ukhuwah')).toBe(
      '/events/pekan-ukhuwah'
    );
    expect(contentDetailHref('/amal', 'wakaf-gedung')).toBe(
      '/amal/wakaf-gedung'
    );
  });

  it('mempertahankan slug apa adanya (tanpa encode ulang)', () => {
    expect(contentDetailHref('/news', 'Berita X')).toBe('/news/Berita X');
  });
});

describe('homeLinks#DETAIL_BASES', () => {
  it('semua base detail merujuk ke rute yang ada', () => {
    DETAIL_BASES.forEach((base) => {
      expect(routeExists(base)).toBe(true);
    });
  });

  it('membangun path yang dimulai dengan base yang valid', () => {
    expect(contentDetailHref('/news', 'x').startsWith('/news')).toBe(true);
    expect(contentDetailHref('/events', 'x').startsWith('/events')).toBe(true);
    expect(contentDetailHref('/amal', 'x').startsWith('/amal')).toBe(true);
  });
});
