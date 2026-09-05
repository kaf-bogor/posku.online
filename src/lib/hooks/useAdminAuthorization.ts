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
 * Cek apakah user adalah admin dengan membandingkan email (dari token) terhadap
 * daftar admin di fs_admin (worker D1). Side-effect: jika bukan admin, signOut.
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

    async function check() {
      if (!user) {
        if (!unsubscribed) {
          setAdminEmails([]);
          setNotAllowed(false);
          setAdminsLoading(false);
        }
        return;
      }

      setAdminsLoading(true);
      setError(null);
      try {
        const token = await user.getIdToken();
        const base =
          process.env.NEXT_PUBLIC_D1_API_URL ||
          'https://posku-d1.kubido.workers.dev';
        const res = await fetch(`${base}/api/me`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = (await res.json().catch(() => ({}))) as {
          admin?: boolean;
          email?: string;
        };

        if (!unsubscribed) {
          setAdminEmails(data.admin && data.email ? [data.email] : []);
          setNotAllowed(Boolean(user && !data.admin));
        }
      } catch (err) {
        if (!unsubscribed) {
          setAdminEmails([]);
          setError(
            `Failed to fetch admin status: ${
              err instanceof Error ? err.message : 'Unknown error'
            }`
          );
        }
      } finally {
        if (!unsubscribed) setAdminsLoading(false);
      }
    }

    check();

    return () => {
      unsubscribed = true;
    };
  }, [user]);

  // Sign out jika user bukan admin
  useEffect(() => {
    if (!adminsLoading && user && notAllowed) {
      const timer = setTimeout(() => {
        signOut(auth);
        setNotAllowed(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [user, notAllowed, adminsLoading]);

  return { adminEmails, adminsLoading, notAllowed, error };
}
