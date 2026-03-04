'use client';

import {
  Alert,
  Box,
  Button,
  Center,
  Heading,
  Icon,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

import useAuth from '~/lib/hooks/useAuth';
import type {
  AttendanceEventDTO,
  AttendanceRecordDTO,
} from '~/lib/types/attendance';

import QrCodeDisplay from './QrCodeDisplay';
import QrScanner from './QrScanner';

export default function KehadiranEventDetailClient({
  event,
  records,
  eventId,
}: {
  event: AttendanceEventDTO | null;
  records: AttendanceRecordDTO[];
  eventId: string;
}) {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.700');
  const muted = useColorModeValue('gray.600', 'gray.300');

  const handleCheckInSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  const myRecord = useMemo(
    () => records.find((r) => r.userEmail === user?.email),
    [records, user?.email]
  );

  if (loading) {
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
          Detail Kehadiran
        </Heading>
        <Text color={muted} mb={4}>
          Silakan masuk untuk melihat detail event kehadiran.
        </Text>
        <Button leftIcon={<FcGoogle />} onClick={login}>
          Masuk dengan Google
        </Button>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box bg={cardBg} borderRadius="xl" p={6} boxShadow="md">
        <Heading size="sm">Event tidak ditemukan</Heading>
        <Text color={muted} fontSize="sm" mt={2}>
          Pastikan tautan event benar.
        </Text>
      </Box>
    );
  }

  return (
    <Box w="100%">
      <Heading size="md" mb={4}>
        {event.title}
      </Heading>

      <Box bg={cardBg} borderRadius="xl" p={5} boxShadow="md" mb={4}>
        {event.description ? (
          <Text color={muted} fontSize="sm" mb={2}>
            {event.description}
          </Text>
        ) : null}
        <Text fontSize="sm" color={muted}>
          Tanggal: {new Date(event.date).toLocaleString('id-ID')}
        </Text>
      </Box>

      {myRecord ? (
        <Alert status="success" borderRadius="xl" mb={4} boxShadow="md" py={4}>
          <Icon as={FaCheckCircle} boxSize={6} color="green.500" mr={3} />
          <Box>
            <Text fontWeight="semibold">Anda sudah check-in</Text>
            <Text fontSize="xs" color={muted}>
              {new Date(myRecord.checkedInAt).toLocaleString('id-ID')}
            </Text>
          </Box>
        </Alert>
      ) : (
        <Box bg={cardBg} borderRadius="xl" p={5} boxShadow="md" mb={4}>
          <QrScanner
            expectedEventId={eventId}
            userEmail={user.email || ''}
            onCheckInSuccess={handleCheckInSuccess}
          />
        </Box>
      )}

      <Box bg={cardBg} borderRadius="xl" p={5} boxShadow="md" mb={4}>
        <QrCodeDisplay eventId={eventId} />
      </Box>

      <Box>
        <Heading size="sm" mb={3}>
          Daftar Kehadiran
        </Heading>

        {records.length === 0 ? (
          <Box bg={cardBg} borderRadius="xl" p={6} boxShadow="md">
            <Text color={muted} fontSize="sm">
              Belum ada yang check-in.
            </Text>
          </Box>
        ) : (
          <Stack spacing={3}>
            {records.map((r) => (
              <Box
                key={r.id}
                bg={cardBg}
                borderRadius="xl"
                p={4}
                boxShadow="md"
              >
                <Text fontWeight="semibold">{r.userEmail}</Text>
                <Text fontSize="xs" color={muted} mt={1}>
                  {new Date(r.checkedInAt).toLocaleString('id-ID')}
                </Text>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
