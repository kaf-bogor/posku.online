'use client';

import {
  Box,
  Center,
  Heading,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

const SITEKEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || '0x4AAAAAAE163Phd3sXR0hu-';
const ACTION = 'site-access';
const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type Status = 'loading' | 'ready' | 'verifying' | 'error';

export default function TurnstileGate() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const muted = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    let cancelled = false;

    const resetWidget = () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.reset(widgetId.current);
      }
    };

    const submitToken = async (token: string) => {
      setStatus('verifying');
      try {
        const res = await fetch('/api/turnstile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json()) as { ok?: boolean };
        if (data.ok) {
          window.location.reload();
          return;
        }
      } catch {
        // jatuh ke error di bawah
      }
      setStatus('error');
      resetWidget();
    };

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: SITEKEY,
        action: ACTION,
        theme: 'auto',
        callback: (token: string) => submitToken(token),
        'error-callback': () => setStatus('error'),
        'expired-callback': () => resetWidget(),
      });
      setStatus('ready');
    };

    if (window.turnstile) {
      renderWidget();
      return () => {
        cancelled = true;
      };
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile]'
    );
    if (existing) {
      existing.addEventListener('load', renderWidget);
      return () => {
        cancelled = true;
        existing.removeEventListener('load', renderWidget);
      };
    }

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = '1';
    script.addEventListener('load', renderWidget);
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener('load', renderWidget);
    };
  }, []);

  return (
    <Center minH="100vh" px={4} py={10}>
      <VStack
        spacing={5}
        align="center"
        textAlign="center"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        boxShadow="lg"
        px={{ base: 6, sm: 10 }}
        py={10}
        maxW="md"
        w="full"
      >
        <Heading size="lg" fontWeight="bold">
          Verifikasi Keamanan
        </Heading>
        <Text fontSize="sm" color={muted}>
          Situs ini dilindungi Cloudflare Turnstile. Selesaikan verifikasi
          singkat di bawah untuk melanjutkan.
        </Text>

        <Box ref={containerRef} minH="65px" />

        {status === 'verifying' && (
          <VStack spacing={2}>
            <Spinner size="md" color="blue.500" />
            <Text fontSize="xs" color={muted}>
              Memverifikasi...
            </Text>
          </VStack>
        )}
        {status === 'loading' && (
          <VStack spacing={2}>
            <Spinner size="sm" color="gray.400" />
            <Text fontSize="xs" color={muted}>
              Memuat verifikasi...
            </Text>
          </VStack>
        )}
        {status === 'error' && (
          <Text fontSize="xs" color="red.500">
            Verifikasi gagal. Silakan muat ulang halaman lalu coba lagi.
          </Text>
        )}
      </VStack>
    </Center>
  );
}
