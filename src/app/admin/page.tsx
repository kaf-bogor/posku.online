'use client';

/* eslint-disable no-console */

import {
  VStack,
  Spinner,
  Box,
  Button,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  Avatar,
} from '@chakra-ui/react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, getDocs, collection, setDoc } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';

import { auth, db } from '~/lib/firebase';

import DonationManager from './DonationManager';
import EventManager from './EventManager';
import NewsManager from './NewsManager';

// Component for loading state
const LoadingView = () => (
  <VStack minH="60vh" justify="center" align="center">
    <Spinner size="xl" />
  </VStack>
);

// Component for login view
const LoginView = ({ onLogin }: { onLogin: () => Promise<void> }) => (
  <VStack minH="60vh" justify="center" align="center">
    <Button colorScheme="teal" onClick={onLogin}>
      Login as Admin
    </Button>
  </VStack>
);

// Component for unauthorized view
const UnauthorizedView = () => (
  <VStack minH="60vh" justify="center" align="center">
    <Spinner size="xl" />
    <Text>Not allowed. Logging out...</Text>
  </VStack>
);

// Component for admin panel
const AdminPanelView = ({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => Promise<void>;
}) => (
  <Box p={4}>
    <HStack mb={4} justify="space-between">
      <Heading size="lg">Admin Panel</Heading>
      <HStack>
        <Avatar size="sm" src={user.photoURL || undefined} />
        <Text>{user.displayName || user.email}</Text>
        <Button
          size="sm"
          colorScheme="red"
          variant="outline"
          onClick={onLogout}
        >
          Logout
        </Button>
      </HStack>
    </HStack>

    <Tabs variant="enclosed" colorScheme="teal">
      <TabList>
        <Tab>Donations</Tab>
        <Tab>News</Tab>
        <Tab>Events</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <DonationManager />
        </TabPanel>
        <TabPanel>
          <NewsManager />
        </TabPanel>
        <TabPanel>
          <EventManager />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Box>
);

// Custom hook for authentication
function useAuth() {
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

      const adminRef = doc(db, 'admin', loginUser.email);
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
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return { user, loading, login, logout };
}

// Custom hook for admin authorization
function useAdminAuthorization(user: User | null) {
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
        console.log('Attempting to fetch admin collection');
        const snapshot = await getDocs(collection(db, 'admin'));
        console.log('Successfully fetched admin collection');
        const emails = snapshot.docs.map((document) => document.data().email);
        console.log('Admin emails:', emails);
        if (!unsubscribed) setAdminEmails(emails);
      } catch (err) {
        console.error('Error fetching admin list:', err);
        if (!unsubscribed) {
          setAdminEmails([]);
          setError(
            `Failed to fetch admin list: ${err instanceof Error ? err.message : 'Unknown error'}`
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
    console.log('Authorization check:', {
      adminsLoading,
      user: user?.email,
      adminEmails,
      isAdmin: user ? adminEmails.includes(user.email || '') : false,
    });
    if (!adminsLoading && user && !adminEmails.includes(user.email || '')) {
      console.log('User not allowed:', user.email);
      setNotAllowed(true);
      setTimeout(() => {
        signOut(auth);
        setNotAllowed(false);
      }, 2000);
    }
  }, [user, adminEmails, adminsLoading]);

  return { adminEmails, adminsLoading, notAllowed, error };
}

export default function AdminPage() {
  const { user, loading, login, logout } = useAuth();
  const { notAllowed, error, adminsLoading } = useAdminAuthorization(user);

  // Show loading view while either auth or admin data is loading
  if (loading || adminsLoading) {
    return <LoadingView />;
  }

  if (!user) {
    return <LoginView onLogin={login} />;
  }

  if (notAllowed) {
    return <UnauthorizedView />;
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return <AdminPanelView user={user} onLogout={logout} />;
}
