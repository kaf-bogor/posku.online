import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { useEffect, useState, useCallback } from 'react';

import { auth } from '~/lib/firebase';

// Custom hook untuk autentikasi (Firebase Auth saja; profil/data tersimpan di D1).
export default function useAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _resourceType?: string
) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        setUser(firebaseUser);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const login = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Login error:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout error:', error);
    }
  }, []);

  return { user, loading, login, logout };
}
