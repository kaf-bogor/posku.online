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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  VStack,
  useColorModeValue,
  Alert,
  AlertIcon,
  Center,
  Spinner,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useToast,
  Flex,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiUsers,
  FiTarget,
  FiClock,
  FiTrendingUp,
  FiEye,
  FiDownload,
} from 'react-icons/fi';

import useAdminAuthorization from '~/lib/hooks/useAdminAuthorization';
import useAuth from '~/lib/hooks/useAuth';
import {
  getAllQuizzes,
  deleteQuiz,
  getQuizAttempts,
} from '~/lib/services/quizService';
import type { Quiz, QuizAttempt } from '~/lib/types/quiz';

const AdminQuizPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth('admin');
  const { notAllowed, adminsLoading } = useAdminAuthorization(user);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<
    Record<string, QuizAttempt[]>
  >({});

  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        const fetchedQuizzes = await getAllQuizzes();
        setQuizzes(fetchedQuizzes);

        // Load attempts for each quiz
        const attemptsPromises = fetchedQuizzes.map(async (quiz) => {
          const attempts = await getQuizAttempts(quiz.id);
          return { quizId: quiz.id, attempts };
        });

        const attemptsResults = await Promise.all(attemptsPromises);
        const attemptsMap = attemptsResults.reduce(
          (acc, { quizId, attempts }) => {
            acc[quizId] = attempts;
            return acc;
          },
          {} as Record<string, QuizAttempt[]>
        );

        setQuizAttempts(attemptsMap);
      } catch {
        toast({
          title: 'Error loading quizzes',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (user && !notAllowed) {
      loadQuizzes();
    }
  }, [user, notAllowed, toast]);

  const handleDeleteQuiz = async (quiz: Quiz) => {
    try {
      setDeleting(quiz.id);
      await deleteQuiz(quiz.id);

      setQuizzes(quizzes.filter((q) => q.id !== quiz.id));
      delete quizAttempts[quiz.id];

      toast({
        title: 'Quiz deleted successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch {
      toast({
        title: 'Error deleting quiz',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setDeleting(null);
    }
  };

  const confirmDelete = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    onOpen();
  };

  const getQuizStats = (quizId: string) => {
    const attempts = quizAttempts[quizId] || [];
    if (attempts.length === 0) {
      return { totalAttempts: 0, averageScore: 0, completionRate: 0 };
    }

    const totalScore = attempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );
    const averageScore = Math.round(totalScore / attempts.length);

    return {
      totalAttempts: attempts.length,
      averageScore,
      completionRate: 100, // Since all entries in quiz_attempts are completed
    };
  };

  const overallStats = useMemo(() => {
    const allAttempts = Object.values(quizAttempts).flat();

    if (allAttempts.length === 0) {
      return {
        totalQuizzes: quizzes.length,
        totalAttempts: 0,
        averageScore: 0,
        uniqueUsers: 0,
      };
    }

    const totalScore = allAttempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );
    const uniqueUsers = new Set(allAttempts.map((a) => a.userId)).size;

    return {
      totalQuizzes: quizzes.length,
      totalAttempts: allAttempts.length,
      averageScore: Math.round(totalScore / allAttempts.length),
      uniqueUsers,
    };
  }, [quizzes, quizAttempts]);

  if (authLoading || adminsLoading) {
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
          Please log in to access the admin panel.
        </Alert>
      </Container>
    );
  }

  if (notAllowed) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center minH="400px">
          <Spinner size="xl" />
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Administrasi Kuis
            </Heading>
            <Text color="gray.600">Kelola kuis dan pantau kinerja</Text>
          </Box>

          <Button
            colorScheme="blue"
            leftIcon={<FiPlus />}
            onClick={() => router.push('/admin/quiz/create')}
          >
            Buat Kuis
          </Button>
        </Flex>

        {/* Statistics */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="sm">
          <CardBody>
            <Heading size="md" mb={4}>
              Statistik Ringkasan
            </Heading>
            <StatGroup>
              <Stat textAlign="center">
                <StatLabel>
                  <Icon as={FiTarget} mr={1} />
                  Total Kuis
                </StatLabel>
                <StatNumber color="blue.500">
                  {overallStats.totalQuizzes}
                </StatNumber>
              </Stat>

              <Stat textAlign="center">
                <StatLabel>
                  <Icon as={FiTrendingUp} mr={1} />
                  Total Percobaan
                </StatLabel>
                <StatNumber color="green.500">
                  {overallStats.totalAttempts}
                </StatNumber>
              </Stat>

              <Stat textAlign="center">
                <StatLabel>
                  <Icon as={FiUsers} mr={1} />
                  Pengguna Unik
                </StatLabel>
                <StatNumber color="purple.500">
                  {overallStats.uniqueUsers}
                </StatNumber>
              </Stat>

              <Stat textAlign="center">
                <StatLabel>
                  <Icon as={FiTrendingUp} mr={1} />
                  Skor Rata-rata
                </StatLabel>
                <StatNumber color="orange.500">
                  {overallStats.averageScore}%
                </StatNumber>
              </Stat>
            </StatGroup>
          </CardBody>
        </Card>

        {/* Quiz List */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4}>
              Quiz List ({quizzes.length} quizzes)
            </Heading>

            {quizzes.length === 0 ? (
              <Box textAlign="center" py={12}>
                <Text fontSize="lg" color="gray.500" mb={4}>
                  No quizzes created yet
                </Text>
                <Button
                  colorScheme="blue"
                  onClick={() => router.push('/admin/quiz/create')}
                >
                  Create Your First Quiz
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Quiz Details</Th>
                      <Th>Level</Th>
                      <Th>Questions</Th>
                      <Th>Time Limit</Th>
                      <Th>Attempts</Th>
                      <Th>Avg. Score</Th>
                      <Th>Created</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {quizzes.map((quiz) => {
                      const stats = getQuizStats(quiz.id);

                      return (
                        <Tr key={quiz.id}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium" noOfLines={1}>
                                {quiz.title}
                              </Text>
                              <Text
                                fontSize="sm"
                                color="gray.500"
                                noOfLines={2}
                              >
                                {quiz.description}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                // eslint-disable-next-line no-nested-ternary
                                quiz.level === 'Beginner'
                                  ? 'green'
                                  : quiz.level === 'Intermediate'
                                    ? 'yellow'
                                    : 'red'
                              }
                            >
                              {quiz.level}
                            </Badge>
                          </Td>
                          <Td>
                            <Text>{quiz.questions.length}</Text>
                          </Td>
                          <Td>
                            <Flex align="center">
                              <Icon as={FiClock} mr={1} />
                              <Text>{quiz.timeLimit} min</Text>
                            </Flex>
                          </Td>
                          <Td>
                            <Text fontWeight="medium" color="blue.500">
                              {stats.totalAttempts}
                            </Text>
                          </Td>
                          <Td>
                            <Text
                              fontWeight="medium"
                              color={
                                // eslint-disable-next-line no-nested-ternary
                                stats.averageScore >= 80
                                  ? 'green.500'
                                  : stats.averageScore >= 60
                                    ? 'yellow.500'
                                    : 'red.500'
                              }
                            >
                              {stats.averageScore || 0}%
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {format(quiz.createdAt, 'MMM dd, yyyy')}
                            </Text>
                          </Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem
                                  icon={<FiEye />}
                                  onClick={() =>
                                    router.push(`/quiz/${quiz.id}`)
                                  }
                                >
                                  Preview Quiz
                                </MenuItem>
                                <MenuItem
                                  icon={<FiEdit />}
                                  onClick={() =>
                                    router.push(`/admin/quiz/${quiz.id}/edit`)
                                  }
                                >
                                  Edit Quiz
                                </MenuItem>
                                <MenuItem
                                  icon={<FiDownload />}
                                  onClick={() =>
                                    router.push(
                                      `/admin/quiz/${quiz.id}/results`
                                    )
                                  }
                                >
                                  View Results
                                </MenuItem>
                                <MenuItem
                                  icon={<FiTrash2 />}
                                  onClick={() => confirmDelete(quiz)}
                                  color="red.500"
                                >
                                  Delete Quiz
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Quiz</ModalHeader>
          <ModalBody>
            <Stack spacing={4}>
              <Text>
                Are you sure you want to delete the quiz &quot;
                {selectedQuiz?.title}&quot;?
              </Text>
              <Alert status="warning" size="sm">
                <AlertIcon />
                This action cannot be undone. All quiz data and user attempts
                will be permanently deleted.
              </Alert>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
              isDisabled={deleting === selectedQuiz?.id}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={() => selectedQuiz && handleDeleteQuiz(selectedQuiz)}
              isLoading={deleting === selectedQuiz?.id}
              loadingText="Deleting..."
            >
              Delete Quiz
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminQuizPage;
