'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Card,
  CardBody,
  Button,
  useColorModeValue,
  useToast,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';

import useAuth from '~/lib/hooks/useAuth';

const QuizAuthPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, loading, login } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/quiz');
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await login();
      toast({
        title: 'Berhasil masuk',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Gagal masuk',
        description:
          error instanceof Error ? error.message : 'Terjadi kesalahan',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="md" py={12}>
        <Center minH="400px">
          <Spinner size="xl" />
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={12}>
      <Stack spacing={8} align="center">
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            Autentikasi Kuis
          </Heading>
          <Text color="gray.600">
            Masuk dengan Google untuk mengakses kuis
          </Text>
        </Box>

        <Card
          w="full"
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
          shadow="lg"
        >
          <CardBody>
            <Stack spacing={6} align="center">
              <Button
                size="lg"
                leftIcon={<FcGoogle />}
                onClick={handleGoogleSignIn}
                isLoading={isSubmitting}
                loadingText="Sedang masuk..."
                width="100%"
              >
                Masuk dengan Google
              </Button>

              <Text textAlign="center" fontSize="sm" color="gray.500">
                Akun akan dibuat otomatis jika belum ada
              </Text>
            </Stack>
          </CardBody>
        </Card>

        <Text textAlign="center" fontSize="sm" color="gray.500">
          Dengan masuk, Anda setuju untuk mengikuti kuis dengan bertanggung jawab dan jujur.
        </Text>
      </Stack>
    </Container>
  );
};

export default QuizAuthPage;