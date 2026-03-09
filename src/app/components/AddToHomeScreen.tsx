'use client';

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaDownload, FaShareAlt, FaTimes } from 'react-icons/fa';

const STORAGE_KEY = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AddToHomeScreen() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('purple.200', 'purple.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone === true);

    if (isStandalone) return;

    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !/crios/i.test(navigator.userAgent) &&
      !/fxios/i.test(navigator.userAgent);

    if (isIOS) {
      setShowIOS(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setShowAndroid(false);
    setShowIOS(false);
    setDeferredPrompt(null);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') dismiss();
    else {
      setDeferredPrompt(null);
      setShowAndroid(false);
    }
  };

  if (!showAndroid && !showIOS) return null;

  return (
    <Box
      position="fixed"
      bottom="72px"
      left="50%"
      transform="translateX(-50%)"
      w={{ base: 'calc(100% - 32px)', md: '480px' }}
      zIndex={200}
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      boxShadow="0 4px 24px rgba(0,0,0,0.15)"
      px={4}
      py={3}
    >
      <Flex align="flex-start" gap={3}>
        <Icon
          as={showIOS ? FaShareAlt : FaDownload}
          color="purple.500"
          boxSize={5}
          mt={1}
          flexShrink={0}
        />
        <Box flex={1}>
          <Text fontWeight="bold" fontSize="sm" color={textColor}>
            Tambahkan ke Layar Utama
          </Text>
          {showIOS ? (
            <Text fontSize="xs" color={subTextColor} mt={0.5}>
              Ketuk ikon{' '}
              <Icon as={FaShareAlt} boxSize={3} verticalAlign="middle" /> di
              bawah, lalu pilih{' '}
              <Text as="span" fontWeight="semibold">
                "Add to Home Screen"
              </Text>
              .
            </Text>
          ) : (
            <Text fontSize="xs" color={subTextColor} mt={0.5}>
              Instal aplikasi untuk akses lebih cepat dari layar utama.
            </Text>
          )}
          {showAndroid && (
            <HStack mt={2} spacing={2}>
              <Button
                size="xs"
                colorScheme="purple"
                leftIcon={<FaDownload />}
                onClick={handleInstall}
              >
                Instal
              </Button>
              <Button size="xs" variant="ghost" onClick={dismiss}>
                Nanti
              </Button>
            </HStack>
          )}
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
