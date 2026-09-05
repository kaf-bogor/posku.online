import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth } from '~/lib/firebase';

export type UseAdminAuthorizationResult = {
  adminEmails: string[];
  adminsLoading: boolean;
  notAllowed: boolean;
  error: string | null;
};

/**
 * Cek apakah user adalah admin dengan membandingkan email terhadap daftar
 * admin publik dari worker D1 (GET /api/admins). Mirip perilaku lama yang
 * membaca daftar admin. Side-effect: jika bukan admin, signOut otomatis.
 */
export default function useAdminAuthorization(
  user: User | null
): UseAdminAuthorizationResult {
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribed = false;

    async function fetchAdmins() {
      setAdminsLoading(true);
      setError(null);
      try {
        const base =
          process.env.NEXT_PUBLIC_D1_API_URL ||
          'https://posku-d1.kubido.workers.dev';
        const res = await fetch(`${base}/api/admins`, {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { data?: string[] };
        const emails = (data.data ?? [])
          .filter(Boolean)
          .map((e) => e.toLowerCase());
        if (!unsubscribed) setAdminEmails(emails);
      } catch (err) {
        if (!unsubscribed) {
          setAdminEmails([]);
          setError(
            `Failed to fetch admin list: ${
              err instanceof Error ? err.message : 'Unknown error'
            }`
          );
        }
      } finally {
        if (!unsubscribed) setAdminsLoading(false);
      }
    }

    fetchAdmins();

    return () => {
      unsubscribed = true;
    };
  }, []);

  // Cek otorisasi user berdasarkan daftar email
  useEffect(() => {
    if (
      !adminsLoading &&
      !error &&
      user &&
      !adminEmails.includes(user.email || '')
    ) {
      setNotAllowed(true);
    }
  }, [user, adminEmails, adminsLoading, error]);

  // Sign out jika user bukan admin
  useEffect(() => {
    if (notAllowed) {
      const timer = setTimeout(() => {
        signOut(auth);
        setNotAllowed(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [notAllowed]);

  return { adminEmails, adminsLoading, notAllowed, error };
}
