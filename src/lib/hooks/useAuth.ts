/* eslint-disable no-console */

import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';

import { auth, db } from '~/lib/firebase';

// Custom hook for authentication
export default function useAuth(resourceType: string = 'users') {
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
      const result = await signInWithPopup(auth, provider);
      const { user: loginUser } = result;

      if (!loginUser.email) return;

      const adminRef = doc(db, resourceType, loginUser.email);
      const now = new Date().toISOString();
      const snapshot = await getDoc(adminRef);

      const data = {
        email: loginUser.email,
        name: loginUser.displayName || loginUser.email,
        last_login: now,
        updated_at: now,
      };

      if (snapshot.exists()) {
        await setDoc(adminRef, data, { merge: true });
      } else {
        await setDoc(adminRef, { ...data, created_at: now });
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }, [resourceType]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return { user, loading, login, logout };
}
