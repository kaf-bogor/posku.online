'use client';

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Heading,
  ListItem,
  OrderedList,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';

import useAttendanceEvents from '~/lib/hooks/useAttendanceEvents';
import useAuth from '~/lib/hooks/useAuth';

export default function KehadiranPageClient() {
  const { user, loading: authLoading, login } = useAuth();
  const { events, loading: eventsLoading, error } = useAttendanceEvents();
  const cardBg = useColorModeValue('white', 'gray.700');
  const muted = useColorModeValue('gray.600', 'gray.300');

  if (authLoading) {
    return (
      <Center py={12}>
        <Spinner size="lg" color="purple.500" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Box w="100%" textAlign="center" py={12}>
        <Heading size="md" mb={2}>
          Kehadiran
        </Heading>
        <Text color={muted} mb={4}>
          Silakan masuk untuk mengakses fitur kehadiran.
        </Text>
        <Button leftIcon={<FcGoogle />} onClick={login}>
          Masuk dengan Google
        </Button>
      </Box>
    );
  }

  if (eventsLoading) {
    return (
      <Center py={12}>
        <Spinner size="lg" color="purple.500" />
      </Center>
    );
  }

  return (
    <Box w="100%">
      <Heading size="md" mb={4}>
        Kehadiran
      </Heading>

      <Box bg={cardBg} borderRadius="xl" p={5} boxShadow="md" mb={5}>
        <Heading size="sm" mb={2}>
          Cara Penggunaan
        </Heading>
        <Text fontSize="sm" color={muted} mb={3}>
          Fitur Kehadiran digunakan untuk mencatat check-in peserta pada setiap
          acara POSKU secara digital dan real-time.
        </Text>
        <OrderedList spacing={1.5} fontSize="sm" color={muted} pl={4}>
          <ListItem>
            Pilih salah satu acara kehadiran pada daftar di bawah.
          </ListItem>
          <ListItem>
            Pada halaman acara, klik <b>Scan QR</b> lalu arahkan kamera ke QR
            code acara untuk check-in secara otomatis.
          </ListItem>
          <ListItem>
            Atau gunakan <b>QR Code Event</b> untuk membuka tautan check-in.
          </ListItem>
          <ListItem>
            Setelah berhasil, nama Anda akan tercatat di <b>Daftar Kehadiran</b>
            .
          </ListItem>
        </OrderedList>
      </Box>

      {error && (
        <Alert status="error" borderRadius="lg" mb={4}>
          <AlertIcon />
          <Text fontSize="sm">{error}</Text>
        </Alert>
      )}

      {events.length === 0 ? (
        <Box bg={cardBg} borderRadius="xl" p={6} boxShadow="md">
          <Text color={muted} fontSize="sm">
            Belum ada event kehadiran.
          </Text>
        </Box>
      ) : (
        <Stack spacing={3}>
          {events.map((ev) => (
            <Box
              key={ev.id}
              as={Link}
              href={`/kehadiran/${ev.id}`}
              bg={cardBg}
              borderRadius="xl"
              p={4}
              boxShadow="md"
              _hover={{ textDecoration: 'none' }}
            >
              <Text fontWeight="semibold">{ev.title}</Text>
              {ev.description ? (
                <Text fontSize="sm" color={muted} noOfLines={2}>
                  {ev.description}
                </Text>
              ) : null}
              <Text fontSize="xs" color={muted} mt={2}>
                {new Date(ev.date).toLocaleString('id-ID')}
              </Text>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
