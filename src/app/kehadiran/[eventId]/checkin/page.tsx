'use client';

import {
  Box,
  Button,
  Center,
  Heading,
  Icon,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

import useAuth from '~/lib/hooks/useAuth';
import { checkInAttendance } from '~/lib/services/attendanceService';

type CheckInStatus = 'idle' | 'loading' | 'success' | 'already' | 'error';

export default function CheckInPage() {
  const params = useParams<{ eventId: string }>();
  const { eventId } = params;

  const { user, loading: authLoading, login } = useAuth();
  const [status, setStatus] = useState<CheckInStatus>('idle');
  const [message, setMessage] = useState('');

  const cardBg = useColorModeValue('white', 'gray.700');
  const muted = useColorModeValue('gray.600', 'gray.300');

  const doCheckIn = useCallback(async () => {
    if (!user?.email || !eventId) return;
    setStatus('loading');

    try {
      const result = await checkInAttendance(eventId, user.email);
      if (result.created) {
        setStatus('success');
        setMessage(result.message);
      } else {
        setStatus('already');
        setMessage(result.message);
      }
    } catch (err) {
      setStatus('error');
      setMessage(
        err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.'
      );
    }
  }, [user, eventId]);

  useEffect(() => {
    if (!authLoading && user && status === 'idle') {
      doCheckIn();
    }
  }, [authLoading, user, status, doCheckIn]);

  if (authLoading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="purple.500" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Center minH="60vh">
        <Box
          bg={cardBg}
          borderRadius="xl"
          p={8}
          boxShadow="lg"
          textAlign="center"
          maxW="sm"
          w="100%"
        >
          <Heading size="md" mb={2}>
            Check-in Kehadiran
          </Heading>
          <Text color={muted} mb={6}>
            Silakan masuk terlebih dahulu untuk melakukan check-in.
          </Text>
          <Button leftIcon={<FcGoogle />} onClick={login} size="lg">
            Masuk dengan Google
          </Button>
        </Box>
      </Center>
    );
  }

  if (status === 'loading') {
    return (
      <Center minH="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
          <Text color={muted}>Memproses check-in...</Text>
        </VStack>
      </Center>
    );
  }

  const isOk = status === 'success' || status === 'already';

  return (
    <Center minH="60vh">
      <Box
        bg={cardBg}
        borderRadius="xl"
        p={8}
        boxShadow="lg"
        textAlign="center"
        maxW="sm"
        w="100%"
      >
        <Icon
          as={isOk ? FaCheckCircle : FaTimesCircle}
          boxSize={16}
          color={isOk ? 'green.400' : 'red.400'}
          mb={4}
        />
        <Heading size="md" mb={2}>
          {isOk ? 'Check-in Berhasil' : 'Check-in Gagal'}
        </Heading>
        <Text color={muted} mb={4}>
          {message}
        </Text>
        <Text fontSize="sm" color={muted}>
          {user.email}
        </Text>
      </Box>
    </Center>
  );
}
