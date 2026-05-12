'use client';

import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';

const STORAGE_KEY = 'push-notification-dismissed';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from(Array.from(rawData).map((char) => char.charCodeAt(0)));
}

export default function PushNotification() {
  const [show, setShow] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('blue.200', 'blue.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (Notification.permission === 'granted') return;
    if (Notification.permission === 'denied') return;

    setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setShow(false);
  };

  const subscribe = async () => {
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        dismiss();
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      localStorage.setItem(STORAGE_KEY, '1');
      setShow(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Push subscription failed:', err);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!show) return null;

  return (
    <Box
      position="fixed"
      bottom="72px"
      left="50%"
      transform="translateX(-50%)"
      w={{ base: 'calc(100% - 32px)', md: '480px' }}
      zIndex={199}
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      boxShadow="0 4px 24px rgba(0,0,0,0.15)"
      px={4}
      py={3}
    >
      <Flex align="flex-start" gap={3}>
        <Icon as={FaBell} color="blue.500" boxSize={5} mt={1} flexShrink={0} />
        <Box flex={1}>
          <Text fontWeight="bold" fontSize="sm" color={textColor}>
            Aktifkan Notifikasi
          </Text>
          <Text fontSize="xs" color={subTextColor} mt={0.5}>
            Dapatkan informasi terbaru langsung di perangkat Anda.
          </Text>
          <Flex mt={2} gap={2}>
            <Button
              size="xs"
              colorScheme="blue"
              leftIcon={<FaBell />}
              onClick={subscribe}
              isLoading={isSubscribing}
            >
              Aktifkan
            </Button>
            <Button size="xs" variant="ghost" onClick={dismiss}>
              Nanti
            </Button>
          </Flex>
        </Box>
        <IconButton
          aria-label="Tutup"
          icon={<FaTimes />}
          size="xs"
          variant="ghost"
          onClick={dismiss}
          flexShrink={0}
        />
      </Flex>
    </Box>
  );
}
