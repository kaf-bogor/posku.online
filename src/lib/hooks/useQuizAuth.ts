import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';

import { auth } from '~/lib/firebase';
import { saveUserProfile, getUserProfile } from '~/lib/services/quizService';
import type { User } from '~/lib/types/quiz';

interface UseQuizAuthReturn {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

export const useQuizAuth = (): UseQuizAuthReturn => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Get or create user profile
          let userProfile = await getUserProfile(firebaseUser.uid);

          if (!userProfile) {
            // Create user profile if it doesn't exist
            const newUser: Omit<User, 'createdAt'> = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName:
                firebaseUser.displayName || firebaseUser.email || 'Anonymous',
              role: 'user', // default role
            };
            await saveUserProfile(newUser);
            userProfile = { ...newUser, createdAt: new Date() };
          }

          setUser(userProfile);
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // User profile will be handled by the auth state change listener
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        await signInWithEmailAndPassword(auth, email, password);
        // User profile will be handled by the auth state change listener
      } catch (error) {
        console.error('Email sign-in error:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        setLoading(true);
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Create user profile
        const newUser: Omit<User, 'createdAt'> = {
          uid: result.user.uid,
          email,
          displayName,
          role: 'user',
        };
        await saveUserProfile(newUser);
      } catch (error) {
        console.error('Email sign-up error:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const isAdmin = user?.role === 'admin';

  return {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    isAdmin,
  };
};
