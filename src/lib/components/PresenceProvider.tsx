'use client';

import type React from 'react';
import { useEffect } from 'react';

import {
  presenceHeartbeat,
  presenceLeave,
} from '~/lib/services/presenceService';

/**
 * Mengirim heartbeat "sedang online" selama halaman terbuka (login maupun
 * pengunjung anonim), agar badge online di homepage akurat.
 */
export default function PresenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const send = () => {
      presenceHeartbeat();
    };

    send();
    const interval = setInterval(send, 60 * 1000);
    const onFocus = () => send();
    window.addEventListener('focus', onFocus);

    const onUnload = () => {
      presenceLeave();
    };
    window.addEventListener('beforeunload', onUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('beforeunload', onUnload);
      presenceLeave();
    };
  }, []);

  return children;
}
