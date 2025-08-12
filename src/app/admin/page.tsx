'use client';

import {
  VStack,
  Spinner,
  Box,
  Button,
  Heading,
  Text,
  Alert,
  AlertIcon,
  HStack,
  Avatar,
  SimpleGrid,
  Card,
  CardBody,
  useColorModeValue,
  Container,
  Flex,
  Icon,
  Divider,
} from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import {
  FaDonate,
  FaNewspaper,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaGoogle,
  FaShieldAlt,
} from 'react-icons/fa';

import useAdminAuthorization from '~/lib/hooks/useAdminAuthorization';
import useAuth from '~/lib/hooks/useAuth';

// Quick Actions Card Component
const QuickActionCard = ({
  title,
  description,
  icon,
  href,
  color = 'blue',
}: {
  title: string;
  description: string;
  icon: IconType;
  href: string;
  color?: string;
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue(`${color}.50`, `${color}.900`);

  return (
    <Card
      as="a"
      href={href}
      bg={cardBg}
      shadow="md"
      borderRadius="xl"
      transition="all 0.3s ease"
      _hover={{
        shadow: 'lg',
        bg: hoverBg,
        transform: 'translateY(-2px)',
      }}
      cursor="pointer"
      position="relative"
    >
      <CardBody p={6}>
        <VStack spacing={4} align="start">
          <HStack justify="space-between" w="100%">
            <Box
              p={3}
              borderRadius="xl"
              bg={useColorModeValue(`${color}.50`, `${color}.900`)}
              color={useColorModeValue(`${color}.500`, `${color}.300`)}
            >
              <Icon as={icon} boxSize={6} />
            </Box>
            <VStack spacing={2} align="start">
              <Heading size="md" fontWeight="bold">
                {title}
              </Heading>
              <Text fontSize="sm" color="gray.500" lineHeight="relaxed">
                {description}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Component for loading state
const LoadingView = () => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Container maxW="container.md" py={20}>
      <Card bg={cardBg} shadow="xl" borderRadius="2xl">
        <CardBody p={12}>
          <VStack spacing={6}>
            <Box
              p={4}
              borderRadius="full"
              bg={useColorModeValue('blue.50', 'blue.900')}
              color={useColorModeValue('blue.500', 'blue.300')}
            >
              <Spinner size="xl" thickness="3px" />
            </Box>
            <VStack spacing={2} textAlign="center">
              <Heading size="lg">Memuat Dashboard</Heading>
              <Text color="gray.500">Menyiapkan panel admin untuk Anda...</Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

// Component for login view
const LoginView = ({ onLogin }: { onLogin: () => Promise<void> }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50)',
    'linear(to-br, blue.900, purple.900)'
  );

  return (
    <Box bg={bgGradient} minH="100vh" py={20}>
      <Container maxW="container.sm">
        <Card bg={cardBg} shadow="2xl" borderRadius="2xl">
          <CardBody p={12}>
            <VStack spacing={8} textAlign="center">
              <VStack spacing={4}>
                <Box
                  p={4}
                  borderRadius="full"
                  bg={useColorModeValue('blue.50', 'blue.900')}
                  color={useColorModeValue('blue.500', 'blue.300')}
                >
                  <FaShieldAlt size={40} />
                </Box>
                <VStack spacing={2}>
                  <Heading size="xl" fontWeight="bold">
                    Admin Panel
                  </Heading>
                  <Text color="gray.500" fontSize="lg">
                    POSKU Al-Fatih Bogor
                  </Text>
                </VStack>
              </VStack>

              <VStack spacing={4} w="100%">
                <Text color="gray.600" textAlign="center">
                  Masuk dengan akun Google yang telah terdaftar sebagai admin
                  untuk mengakses panel manajemen konten.
                </Text>

                <Button
                  size="lg"
                  colorScheme="blue"
                  leftIcon={<FaGoogle />}
                  onClick={onLogin}
                  w="100%"
                  borderRadius="xl"
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                  _hover={{ transform: 'translateY(-2px)' }}
                >
                  Masuk dengan Google
                </Button>
              </VStack>

              <Divider />

              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <Text fontSize="sm">
                  Hanya admin yang terdaftar yang dapat mengakses panel ini.
                </Text>
              </Alert>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

// Component for unauthorized view
const UnauthorizedView = () => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Container maxW="container.md" py={20}>
      <Card bg={cardBg} shadow="xl" borderRadius="2xl">
        <CardBody p={12}>
          <VStack spacing={6}>
            <Box
              p={4}
              borderRadius="full"
              bg={useColorModeValue('red.50', 'red.900')}
              color={useColorModeValue('red.500', 'red.300')}
            >
              <Spinner size="xl" thickness="3px" />
            </Box>
            <VStack spacing={2} textAlign="center">
              <Heading size="lg" color="red.500">
                Akses Ditolak
              </Heading>
              <Text color="gray.500">
                Anda tidak memiliki izin untuk mengakses panel admin. Akan
                logout otomatis...
              </Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

// useAdminAuthorization moved to ~/lib/hooks/useAdminAuthorization

export default function AdminPage() {
  const { user, loading, login, logout } = useAuth('admin');
  const { notAllowed, error, adminsLoading } = useAdminAuthorization(user);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

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
      <Container maxW="container.lg" py={20}>
        <Alert status="error" borderRadius="xl" p={6}>
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Heading size="md">Error Loading Admin Panel</Heading>
            <Text>{error}</Text>
          </VStack>
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" pb={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardBody p={6}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <VStack align="start" spacing={1}>
                  <Heading size="xl" fontWeight="bold">
                    Admin Dashboard
                  </Heading>
                  <Text color="gray.500" fontSize="md">
                    Panel manajemen POSKU Al-Fatih Bogor
                  </Text>
                </VStack>
                <HStack spacing={4}>
                  <HStack spacing={3}>
                    <Avatar
                      size="md"
                      src={user.photoURL || undefined}
                      name={user.displayName || user.email || undefined}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="semibold" fontSize="sm">
                        {user.displayName || 'Admin'}
                      </Text>
                      <Text color="gray.500" fontSize="xs">
                        {user.email}
                      </Text>
                    </VStack>
                  </HStack>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={logout}
                    borderRadius="lg"
                  >
                    Logout
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <VStack spacing={6} align="stretch">
            <Heading size="lg" fontWeight="bold">
              Manajemen Konten
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={6}>
              <QuickActionCard
                title="Kelola Amal"
                description="Tambah, edit, dan kelola kampanye amal serta tracking dana yang terkumpul"
                icon={FaDonate}
                href="/admin/amal"
                color="green"
              />
              <QuickActionCard
                title="Fund Raise Kelas"
                description="Kelola fundraising per kelas dan tracking progress setiap program"
                icon={FaChalkboardTeacher}
                href="/admin/kelas"
                color="orange"
              />
              <QuickActionCard
                title="Kelola Acara"
                description="Manajemen event dan kegiatan yang akan berlangsung atau telah selesai"
                icon={FaCalendarAlt}
                href="/admin/events"
                color="blue"
              />
              <QuickActionCard
                title="Kelola Berita"
                description="Publikasi berita terbaru dan update informasi untuk komunitas"
                icon={FaNewspaper}
                href="/admin/news"
                color="purple"
              />
            </SimpleGrid>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
