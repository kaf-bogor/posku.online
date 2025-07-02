'use client';

import { VStack, Spinner, Box, Button, Heading, Text } from '@chakra-ui/react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth } from '~/lib/firebase';

import DonationManager from './DonationManager';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch admin emails from Firestore
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    let unsubscribed = false;
    async function fetchAdmins() {
      setAdminsLoading(true);
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('~/lib/firebase');
        const snapshot = await getDocs(collection(db, 'admin'));
        const emails = snapshot.docs
          .map((doc) => doc.data().email)
          .filter(Boolean);
        if (!unsubscribed) setAdminEmails(emails);
      } catch {
        if (!unsubscribed) setAdminEmails([]);
      }
      if (!unsubscribed) setAdminsLoading(false);
    }
    fetchAdmins();
    return () => {
      unsubscribed = true;
    };
  }, []);

  useEffect(() => {
    if (!adminsLoading && user && !adminEmails.includes(user.email || '')) {
      setNotAllowed(true);
      setTimeout(() => {
        signOut(auth);
        setNotAllowed(false);
      }, 2000);
    }
  }, [user, adminEmails, adminsLoading]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <VStack minH="60vh" justify="center" align="center">
        <Spinner size="xl" />
      </VStack>
    );
  }

  if (!user) {
    return (
      <VStack minH="60vh" justify="center" align="center">
        <Button colorScheme="teal" onClick={handleLogin}>
          Login as Admin
        </Button>
      </VStack>
    );
  }

  if (notAllowed) {
    return (
      <VStack minH="60vh" justify="center" align="center">
        <Spinner size="xl" />
        <p>Not allowed. Logging out...</p>
      </VStack>
    );
  }

  // Show admin panel if authenticated and allowed
  return (
    <Box
      maxW="600px"
      mx="auto"
      mt={12}
      p={6}
      borderRadius="md"
      boxShadow="lg"
      bg="white"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="lg">Admin Panel</Heading>
        <Text>Welcome, {user.displayName || user.email}</Text>
        <Button
          colorScheme="red"
          variant="outline"
          onClick={handleLogout}
          alignSelf="flex-end"
        >
          Logout
        </Button>
        {/* Donation management UI */}
        <Box mt={8} p={4} bg="gray.50" borderRadius="md">
          <Heading size="md" mb={4}>
            Donation Management
          </Heading>
          <DonationManager />
        </Box>
      </VStack>
    </Box>
  );
}
