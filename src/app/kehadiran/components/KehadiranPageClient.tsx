'use client';

import {
  Box,
  Button,
  Center,
  Heading,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';

import useAuth from '~/lib/hooks/useAuth';
import type { AttendanceEventDTO } from '~/lib/types/attendance';

export default function KehadiranPageClient({
  initialEvents,
}: {
  initialEvents: AttendanceEventDTO[];
}) {
  const { user, loading, login } = useAuth();
  const cardBg = useColorModeValue('white', 'gray.700');
  const muted = useColorModeValue('gray.600', 'gray.300');

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

  return (
    <Box w="100%">
      <Heading size="md" mb={4}>
        Kehadiran
      </Heading>

      {initialEvents.length === 0 ? (
        <Box bg={cardBg} borderRadius="xl" p={6} boxShadow="md">
          <Text color={muted} fontSize="sm">
            Belum ada event kehadiran.
          </Text>
        </Box>
      ) : (
        <Stack spacing={3}>
          {initialEvents.map((ev) => (
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
