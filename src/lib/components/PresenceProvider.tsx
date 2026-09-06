'use client';

import type React from 'react';
import { useEffect } from 'react';

import useAuth from '~/lib/hooks/useAuth';
import {
  presenceHeartbeat,
  presenceLeave,
} from '~/lib/services/presenceService';

/**
 * Mengirim heartbeat "sedang online" selama user login & halaman terbuka,
 * agar namanya muncul pada daftar online di homepage.
 */
export default function PresenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return undefined;

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
  }, [user]);

  return children;
}
