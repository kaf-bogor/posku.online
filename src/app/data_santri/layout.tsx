'use client';

import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Spinner,
  Card,
  CardBody,
  useColorModeValue,
  useToast,
  Flex,
  Stack,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FiLogOut, FiLock } from 'react-icons/fi';

import useAuth from '~/lib/hooks/useAuth';

export default function DataSantriLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading, login, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const profileBg = useColorModeValue('gray.50', 'gray.750');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const iconBg = useColorModeValue('blue.50', 'blue.900');
  const cardShadow = useColorModeValue('md', 'dark-lg');

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await login();
      toast({
        title: 'Berhasil masuk',
        description: 'Anda telah berhasil masuk ke data santri.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Gagal masuk',
        description:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat masuk.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show a centered loading spinner while checking auth status
  if (loading) {
    return (
      <Center minH="400px" py={12}>
        <VStack spacing={4}>
          <Spinner size="xl" thickness="3px" color="blue.500" />
          <Text color="gray.500" fontSize="sm">
            Memeriksa status masuk...
          </Text>
        </VStack>
      </Center>
    );
  }

  // If not logged in, render the login card
  if (!user) {
    return (
      <Container maxW="md" py={12}>
        <Stack spacing={8} align="center">
          <Card
            w="full"
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            shadow={cardShadow}
            borderRadius="2xl"
          >
            <CardBody p={8}>
              <VStack spacing={6} align="center">
                <Box p={4} borderRadius="full" bg={iconBg} color={accentColor}>
                  <FiLock size={36} />
                </Box>

                <VStack spacing={2} textAlign="center">
                  <Heading size="lg" fontWeight="bold">
                    Akses Terbatas
                  </Heading>
                  <Text color={mutedTextColor} fontSize="sm">
                    Silakan masuk menggunakan akun Google Anda untuk mengakses
                    data santri Kuttab Al-Fatih Bogor.
                  </Text>
                </VStack>

                <Button
                  size="lg"
                  colorScheme="blue"
                  leftIcon={<FcGoogle />}
                  onClick={handleGoogleSignIn}
                  isLoading={isSubmitting}
                  loadingText="Sedang masuk..."
                  width="100%"
                  borderRadius="xl"
                  py={6}
                  fontSize="md"
                  fontWeight="bold"
                  shadow="sm"
                  _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                  transition="all 0.2s"
                >
                  Masuk dengan Google
                </Button>

                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Hanya akun yang terautentikasi yang diperbolehkan mengakses
                  halaman ini.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Stack>
      </Container>
    );
  }

  // Render the children with a top profile status bar if authenticated
  return (
    <Box maxW="2xl" mx="auto" px={{ base: 4, sm: 6 }} py={2}>
      <Flex
        justify="space-between"
        align="center"
        bg={profileBg}
        p={3}
        px={4}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        mb={6}
        shadow="sm"
      >
        <HStack spacing={3}>
          <Avatar
            size="sm"
            name={user.displayName || ''}
            src={user.photoURL || undefined}
          />
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
              {user.displayName || user.email}
            </Text>
            <Text fontSize="10px" color="gray.500" noOfLines={1}>
              {user.email}
            </Text>
          </VStack>
        </HStack>
        <Button
          size="xs"
          colorScheme="red"
          variant="ghost"
          leftIcon={<FiLogOut />}
          onClick={logout}
          borderRadius="lg"
        >
          Keluar
        </Button>
      </Flex>

      {children}
    </Box>
  );
}
