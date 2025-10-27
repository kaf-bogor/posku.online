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
  Badge,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Alert,
  AlertIcon,
  Center,
  Spinner,
  Flex,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Select,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { FiTrendingUp, FiClock, FiTarget, FiHome, FiEye } from 'react-icons/fi';

import { useQuiz } from '~/lib/context/quizContext';
import useAuth from '~/lib/hooks/useAuth';

const QuizHistoryPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { userAttempts, quizzes, loading } = useQuiz();

  const [levelFilter, setLevelFilter] = useState('all');

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const filteredAttempts = useMemo(() => {
    if (levelFilter === 'all') return userAttempts;

    return userAttempts.filter((attempt) => {
      const quiz = quizzes.find((q) => q.id === attempt.quizId);
      return quiz?.level === levelFilter;
    });
  }, [userAttempts, quizzes, levelFilter]);

  const getQuizTitle = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    return quiz?.title || 'Kuis Tidak Dikenal';
  };

  const getQuizLevel = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    return quiz?.level || 'Tidak Dikenal';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = useMemo(() => {
    if (filteredAttempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        totalTimeSpent: 0,
      };
    }

    const totalScore = filteredAttempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );
    const totalTime = filteredAttempts.reduce(
      (sum, attempt) => sum + attempt.timeSpent,
      0
    );

    return {
      totalAttempts: filteredAttempts.length,
      averageScore: Math.round(totalScore / filteredAttempts.length),
      highestScore: Math.max(...filteredAttempts.map((a) => a.score)),
      totalTimeSpent: totalTime,
    };
  }, [filteredAttempts]);

  const levels = useMemo(() => {
    const uniqueLevels = new Set(quizzes.map((q) => q.level));
    return Array.from(uniqueLevels).sort();
  }, [quizzes]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center minH="400px">
          <Spinner size="xl" />
        </Center>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          Silakan masuk untuk melihat riwayat kuis Anda.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        {/* Header */}
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            Riwayat Kuis
          </Heading>
          <Text color="gray.600">
            Lacak kemajuan Anda dan tinjau kinerja kuis Anda sebelumnya
          </Text>
        </Box>

        {userAttempts.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.500" mb={4}>
              Belum ada percobaan kuis
            </Text>
            <Text color="gray.400" mb={6}>
              Mulai mengikuti kuis untuk melihat kemajuan Anda di sini!
            </Text>
            <Button colorScheme="blue" onClick={() => router.push('/quiz')}>
              Jelajahi Kuis
            </Button>
          </Box>
        ) : (
          <>
            {/* Statistics */}
            <Card
              bg={cardBg}
              border="1px"
              borderColor={borderColor}
              shadow="sm"
            >
              <CardBody>
                <Heading size="md" mb={4}>
                  Statistik Anda
                </Heading>
                <StatGroup>
                  <Stat textAlign="center">
                    <StatLabel>
                      <Icon as={FiTarget} mr={1} />
                      Total Percobaan
                    </StatLabel>
                    <StatNumber color="blue.500">
                      {stats.totalAttempts}
                    </StatNumber>
                  </Stat>

                  <Stat textAlign="center">
                    <StatLabel>
                      <Icon as={FiTrendingUp} mr={1} />
                      Skor Rata-rata
                    </StatLabel>
                    <StatNumber
                      color={`${getScoreColor(stats.averageScore)}.500`}
                    >
                      {stats.averageScore}%
                    </StatNumber>
                  </Stat>

                  <Stat textAlign="center">
                    <StatLabel>
                      <Icon as={FiTarget} mr={1} />
                      Skor Tertinggi
                    </StatLabel>
                    <StatNumber color="green.500">
                      {stats.highestScore}%
                    </StatNumber>
                  </Stat>

                  <Stat textAlign="center">
                    <StatLabel>
                      <Icon as={FiClock} mr={1} />
                      Total Waktu
                    </StatLabel>
                    <StatNumber>
                      {formatDuration(stats.totalTimeSpent)}
                    </StatNumber>
                  </Stat>
                </StatGroup>
              </CardBody>
            </Card>

            {/* Filter */}
            <HStack justify="space-between" align="center">
              <Heading size="md">
                Riwayat Kuis ({filteredAttempts.length} percobaan)
              </Heading>

              <Select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                maxW="200px"
              >
                <option value="all">Semua Tingkat</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
            </HStack>

            {/* History Table */}
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody p={0}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Kuis</Th>
                        <Th>Tingkat</Th>
                        <Th>Skor</Th>
                        <Th>Pertanyaan</Th>
                        <Th>Waktu Digunakan</Th>
                        <Th>Tanggal</Th>
                        <Th>Aksi</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredAttempts.map((attempt) => (
                        <Tr key={attempt.id}>
                          <Td>
                            <Text fontWeight="medium" noOfLines={2}>
                              {getQuizTitle(attempt.quizId)}
                            </Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                // eslint-disable-next-line no-nested-ternary
                                getQuizLevel(attempt.quizId) === 'Beginner'
                                  ? 'green'
                                  : getQuizLevel(attempt.quizId) ===
                                      'Intermediate'
                                    ? 'yellow'
                                    : 'red'
                              }
                            >
                              {getQuizLevel(attempt.quizId)}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getScoreColor(attempt.score)}
                              fontSize="sm"
                              px={2}
                              py={1}
                            >
                              {attempt.score}%
                            </Badge>
                          </Td>
                          <Td>
                            <Text>
                              {Object.keys(attempt.answers).length} /{' '}
                              {attempt.totalQuestions}
                            </Text>
                          </Td>
                          <Td>
                            <Flex align="center">
                              <Icon as={FiClock} mr={1} />
                              <Text>{formatDuration(attempt.timeSpent)}</Text>
                            </Flex>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {format(attempt.submittedAt, 'MMM dd, yyyy')}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {format(attempt.submittedAt, 'HH:mm')}
                            </Text>
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              leftIcon={<FiEye />}
                              onClick={() =>
                                router.push(`/quiz/${attempt.quizId}/result`)
                              }
                              variant="outline"
                            >
                              Lihat
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>

            {filteredAttempts.length === 0 && levelFilter !== 'all' && (
              <Box textAlign="center" py={8}>
                <Text fontSize="lg" color="gray.500">
                  Tidak ada percobaan ditemukan untuk tingkat {levelFilter}
                </Text>
                <Button
                  variant="link"
                  onClick={() => setLevelFilter('all')}
                  mt={2}
                >
                  Tampilkan semua percobaan
                </Button>
              </Box>
            )}
          </>
        )}

        {/* Actions */}
        <HStack justify="center" spacing={4}>
          <Button
            leftIcon={<FiHome />}
            onClick={() => router.push('/quiz')}
            variant="outline"
          >
            Jelajahi Kuis
          </Button>
        </HStack>
      </Stack>
    </Container>
  );
};

export default QuizHistoryPage;
