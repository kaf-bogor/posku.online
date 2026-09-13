'use client';

import { useEffect } from 'react';

/**
 * Membersihkan service worker PWA lama (dari Next.js/next-pwa) yang masih
 * tersimpan di browser pengunjung. Tanpa ini, SW lama bisa terus menyajikan
 * cache versi lama (mis. build Vercel) meski origin sudah pindah ke Worker.
 */
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((reg) => reg.unregister()))
      .catch(() => {});
  }, []);

  return null;
}
