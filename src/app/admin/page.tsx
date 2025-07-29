'use client';

/* eslint-disable no-console */

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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Container,
  Flex,
  Badge,
  Icon,
  Divider,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, getDocs, collection, setDoc } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';
import {
  FaDonate,
  FaNewspaper,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaUsers,
  FaChartLine,
  FaCog,
  FaEye,
  FaHeart,
  FaGoogle,
  FaShieldAlt,
  FaTrendingUp,
  FaCalendarDay,
  FaMoneyBillWave,
} from 'react-icons/fa';

import { auth, db } from '~/lib/firebase';
import { formatIDR } from '~/lib/utils/currency';

// Dashboard Stats Card Component
const StatsCard = ({
  title,
  value,
  icon,
  change,
  color = 'blue',
  isLoading = false,
}: {
  title: string;
  value: string | number;
  icon: any;
  change?: { value: number; trend: 'up' | 'down' };
  color?: string;
  isLoading?: boolean;
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const iconBg = useColorModeValue(`${color}.50`, `${color}.900`);
  const iconColor = useColorModeValue(`${color}.500`, `${color}.300`);

  return (
    <Card bg={cardBg} shadow="md" borderRadius="xl" overflow="hidden">
      <CardBody p={6}>
        <Flex justify="space-between" align="start">
          <Box>
            <Stat>
              <StatLabel fontSize="sm" fontWeight="medium" color="gray.500">
                {title}
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" mt={2}>
                {isLoading ? <Spinner size="sm" /> : value}
              </StatNumber>
              {change && (
                <StatHelpText mt={2} mb={0}>
                  <StatArrow
                    type={change.trend === 'up' ? 'increase' : 'decrease'}
                  />
                  {Math.abs(change.value)}%
                </StatHelpText>
              )}
            </Stat>
          </Box>
          <Box p={3} borderRadius="xl" bg={iconBg} color={iconColor}>
            <Icon as={icon} boxSize={6} />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};

// Quick Actions Card Component
const QuickActionCard = ({
  title,
  description,
  icon,
  href,
  color = 'blue',
  badge,
}: {
  title: string;
  description: string;
  icon: any;
  href: string;
  color?: string;
  badge?: string;
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
            {badge && (
              <Badge
                colorScheme={color}
                variant="subtle"
                borderRadius="full"
                px={3}
              >
                {badge}
              </Badge>
            )}
          </HStack>
          <VStack spacing={2} align="start">
            <Heading size="md" fontWeight="bold">
              {title}
            </Heading>
            <Text fontSize="sm" color="gray.500" lineHeight="relaxed">
              {description}
            </Text>
          </VStack>
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

// Custom hook for authentication
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        setUser(firebaseUser);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const login = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { user: loginUser } = result;

      if (!loginUser.email) return;

      const adminRef = doc(db, 'admin', loginUser.email);
      const now = new Date().toISOString();
      const snapshot = await getDoc(adminRef);

      const data = {
        email: loginUser.email,
        name: loginUser.displayName || loginUser.email,
        last_login: now,
        updated_at: now,
      };

      if (snapshot.exists()) {
        await setDoc(adminRef, data, { merge: true });
      } else {
        await setDoc(adminRef, { ...data, created_at: now });
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return { user, loading, login, logout };
}

// Custom hook for admin authorization
function useAdminAuthorization(user: User | null) {
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch admin emails
  useEffect(() => {
    let unsubscribed = false;

    async function fetchAdmins() {
      setAdminsLoading(true);
      setError(null);

      try {
        console.log('Attempting to fetch admin collection');
        const snapshot = await getDocs(collection(db, 'admin'));
        console.log('Successfully fetched admin collection');
        const emails = snapshot.docs.map((document) => document.data().email);
        console.log('Admin emails:', emails);
        if (!unsubscribed) setAdminEmails(emails);
      } catch (err) {
        console.error('Error fetching admin list:', err);
        if (!unsubscribed) {
          setAdminEmails([]);
          setError(
            `Failed to fetch admin list: ${err instanceof Error ? err.message : 'Unknown error'}`
          );
        }
      } finally {
        if (!unsubscribed) setAdminsLoading(false);
      }
    }

    fetchAdmins();

    return () => {
      unsubscribed = true;
    };
  }, []);

  // Check if user is authorized
  useEffect(() => {
    if (!adminsLoading && user && !adminEmails.includes(user.email || '')) {
      console.log('User not allowed:', user.email);
      setNotAllowed(true);
      setTimeout(() => {
        signOut(auth);
        setNotAllowed(false);
      }, 2000);
    }
  }, [user, adminEmails, adminsLoading]);

  return { adminEmails, adminsLoading, notAllowed, error };
}

// Dashboard stats hook
function useDashboardStats() {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalEvents: 0,
    totalNews: 0,
    totalFunding: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [donationsSnap, eventsSnap, newsSnap] = await Promise.all([
          getDocs(collection(db, 'donations')),
          getDocs(collection(db, 'events')),
          getDocs(collection(db, 'news')),
        ]);

        const donations = donationsSnap.docs.map((doc) => doc.data());
        const totalFunding = donations.reduce((sum, donation) => {
          const donors = donation.donors || [];
          return (
            sum +
            donors.reduce(
              (donationSum: number, donor: any) =>
                donationSum + (donor.value || 0),
              0
            )
          );
        }, 0);

        setStats({
          totalDonations: donationsSnap.size,
          totalEvents: eventsSnap.size,
          totalNews: newsSnap.size,
          totalFunding,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return stats;
}

export default function AdminPage() {
  const { user, loading, login, logout } = useAuth();
  const { notAllowed, error, adminsLoading } = useAdminAuthorization(user);
  const stats = useDashboardStats();

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

          {/* Dashboard Stats */}
          <VStack spacing={6} align="stretch">
            <Heading size="lg" fontWeight="bold">
              Statistik Dashboard
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <StatsCard
                title="Total Kampanye Donasi"
                value={stats.totalDonations}
                icon={FaDonate}
                color="green"
                isLoading={stats.loading}
                change={{ value: 12, trend: 'up' }}
              />
              <StatsCard
                title="Total Acara"
                value={stats.totalEvents}
                icon={FaCalendarAlt}
                color="blue"
                isLoading={stats.loading}
                change={{ value: 8, trend: 'up' }}
              />
              <StatsCard
                title="Total Berita"
                value={stats.totalNews}
                icon={FaNewspaper}
                color="purple"
                isLoading={stats.loading}
                change={{ value: 5, trend: 'up' }}
              />
              <StatsCard
                title="Total Dana Terkumpul"
                value={
                  stats.loading ? 'Loading...' : formatIDR(stats.totalFunding)
                }
                icon={FaMoneyBillWave}
                color="orange"
                isLoading={stats.loading}
                change={{ value: 15, trend: 'up' }}
              />
            </SimpleGrid>
          </VStack>

          {/* Quick Actions */}
          <VStack spacing={6} align="stretch">
            <Heading size="lg" fontWeight="bold">
              Manajemen Konten
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={6}>
              <QuickActionCard
                title="Kelola Donasi"
                description="Tambah, edit, dan kelola kampanye donasi serta tracking dana yang terkumpul"
                icon={FaDonate}
                href="/admin/donations"
                color="green"
                badge="Primary"
              />
              <QuickActionCard
                title="Kelola Acara"
                description="Manajemen event dan kegiatan yang akan berlangsung atau telah selesai"
                icon={FaCalendarAlt}
                href="/admin/events"
                color="blue"
                badge="Active"
              />
              <QuickActionCard
                title="Kelola Berita"
                description="Publikasi berita terbaru dan update informasi untuk komunitas"
                icon={FaNewspaper}
                href="/admin/news"
                color="purple"
                badge="Content"
              />
              <QuickActionCard
                title="Fund Raise Kelas"
                description="Kelola fundraising per kelas dan tracking progress setiap program"
                icon={FaChalkboardTeacher}
                href="/admin/kelas"
                color="orange"
                badge="Education"
              />
            </SimpleGrid>
          </VStack>

          {/* Recent Activity */}
          <VStack spacing={6} align="stretch">
            <Heading size="lg" fontWeight="bold">
              Aktivitas Terbaru
            </Heading>
            <Card bg={cardBg} shadow="md" borderRadius="xl">
              <CardBody p={6}>
                <TableContainer>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr>
                        <Th>Aktivitas</Th>
                        <Th>Kategori</Th>
                        <Th>Waktu</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>
                          <HStack spacing={3}>
                            <Box
                              p={2}
                              borderRadius="lg"
                              bg={useColorModeValue('green.50', 'green.900')}
                              color={useColorModeValue(
                                'green.500',
                                'green.300'
                              )}
                            >
                              <FaDonate size={16} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold" fontSize="sm">
                                Campaign Wakaf ATS Published
                              </Text>
                              <Text color="gray.500" fontSize="xs">
                                Kampanye donasi baru telah dipublikasikan
                              </Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="green" variant="subtle">
                            Donasi
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.500">
                            2 jam lalu
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="green">Published</Badge>
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>
                          <HStack spacing={3}>
                            <Box
                              p={2}
                              borderRadius="lg"
                              bg={useColorModeValue('blue.50', 'blue.900')}
                              color={useColorModeValue('blue.500', 'blue.300')}
                            >
                              <FaCalendarAlt size={16} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold" fontSize="sm">
                                Event Rapat Bilistiwa Created
                              </Text>
                              <Text color="gray.500" fontSize="xs">
                                Event baru berhasil ditambahkan
                              </Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle">
                            Event
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.500">
                            5 jam lalu
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue">Active</Badge>
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>
                          <HStack spacing={3}>
                            <Box
                              p={2}
                              borderRadius="lg"
                              bg={useColorModeValue('purple.50', 'purple.900')}
                              color={useColorModeValue(
                                'purple.500',
                                'purple.300'
                              )}
                            >
                              <FaNewspaper size={16} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold" fontSize="sm">
                                Berita Tahun Ajaran Baru
                              </Text>
                              <Text color="gray.500" fontSize="xs">
                                Artikel berita berhasil dipublikasikan
                              </Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="purple" variant="subtle">
                            Berita
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.500">
                            1 hari lalu
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="purple">Published</Badge>
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
