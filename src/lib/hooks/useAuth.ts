import { useCallback, useEffect, useState } from 'react';

import { fetchMe, logoutSession } from '~/lib/auth/googleSession';
import type { AuthUser } from '~/lib/types/auth';

// Autentikasi admin (Google OAuth langsung; tanpa Firebase).
export default function useAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _resourceType?: string
) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchMe().then((u) => {
      if (active) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async () => {
    const target = window.location.pathname + window.location.search;
    window.location.assign(
      `/api/auth/google?next=${encodeURIComponent(target)}`
    );
  }, []);

  const logout = useCallback(async () => {
    await logoutSession();
    window.location.reload();
  }, []);

  return { user, loading, login, logout };
}
