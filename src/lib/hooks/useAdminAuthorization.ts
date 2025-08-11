import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { auth, db } from '~/lib/firebase';

export type UseAdminAuthorizationResult = {
  adminEmails: string[];
  adminsLoading: boolean;
  notAllowed: boolean;
  error: string | null;
};

/**
 * Check whether a user is authorized as admin by comparing their email
 * against the emails stored in the `admin` Firestore collection.
 *
 * Side-effect: if the user is not authorized, it triggers signOut after 2s.
 */
export default function useAdminAuthorization(
  user: User | null
): UseAdminAuthorizationResult {
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch admin emails
  useEffect(() => {
    let unsubscribed = false;

    async function fetchAdmins() {
      setAdminsLoading(true);
      setError(null);

      try {
        const snapshot = await getDocs(collection(db, 'admin'));
        const emails = snapshot.docs.map(
          (document) => (document.data() as { email?: string }).email || ''
        );
        if (!unsubscribed) setAdminEmails(emails.filter(Boolean));
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

  // Check if user is authorized
  useEffect(() => {
    if (!adminsLoading && user && !adminEmails.includes(user.email || '')) {
      setNotAllowed(true);
      setTimeout(() => {
        signOut(auth);
        setNotAllowed(false);
      }, 2000);
    }
  }, [user, adminEmails, adminsLoading]);

  return { adminEmails, adminsLoading, notAllowed, error };
}
