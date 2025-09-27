'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stack,
  Badge,
  Button,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Flex,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { FiClock, FiPlay, FiCheck, FiLock } from 'react-icons/fi';

import { useQuiz } from '~/lib/context/quizContext';
import useAuth from '~/lib/hooks/useAuth';

const QuizListPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { quizzes, loading: quizLoading, hasAttempted, error } = useQuiz();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (quizLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center minH="400px">
          <Spinner size="xl" />
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  const handleStartQuiz = (quizId: string) => {
    if (!user) {
      router.push('/quiz/auth');
      return;
    }
    router.push(`/quiz/${quizId}`);
  };

  const handleViewResult = (quizId: string) => {
    if (!user) {
      router.push('/quiz/auth');
      return;
    }
    router.push(`/quiz/${quizId}/result`);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={6}>
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            Kuis Tersedia
          </Heading>
          <Text color="gray.600">
            Pilih kuis untuk menguji pengetahuan Anda. Setiap kuis hanya dapat
            dicoba sekali.
          </Text>
        </Box>

        {quizzes.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.500">
              Belum ada kuis yang tersedia saat ini.
            </Text>
            <Text color="gray.400" mt={2}>
              Silakan kembali nanti untuk kuis baru!
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {quizzes.map((quiz) => {
              const attempted = hasAttempted(quiz.id);

              return (
                <Card
                  key={quiz.id}
                  bg={cardBg}
                  border="1px"
                  borderColor={borderColor}
                  shadow="sm"
                  _hover={{
                    shadow: 'md',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.2s"
                >
                  <CardBody>
                    <Stack spacing={4}>
                      <Box>
                        <Flex justify="space-between" align="start" mb={2}>
                          <Heading size="md" noOfLines={2}>
                            {quiz.title}
                          </Heading>
                          <Badge
                            colorScheme={
                              quiz.level === 'Beginner'
                                ? 'green'
                                : quiz.level === 'Intermediate'
                                  ? 'yellow'
                                  : 'red'
                            }
                          >
                            {quiz.level}
                          </Badge>
                        </Flex>

                        <Text color="gray.600" fontSize="sm" noOfLines={3}>
                          {quiz.description}
                        </Text>
                      </Box>

                      <Flex
                        align="center"
                        gap={4}
                        fontSize="sm"
                        color="gray.500"
                      >
                        <Flex align="center" gap={1}>
                          <Icon as={FiClock} />
                          <Text>{quiz.timeLimit} min</Text>
                        </Flex>

                        <Text>{quiz.questions.length} pertanyaan</Text>
                      </Flex>

                      <Button
                        colorScheme="blue"
                        leftIcon={<FiPlay />}
                        onClick={() => handleStartQuiz(quiz.id)}
                        size="sm"
                      >
                        {user ? 'Detail' : 'Login untuk Lihat Detail'}
                      </Button>

                      {user && attempted && (
                        <Box>
                          <Badge colorScheme="green" size="sm">
                            <Icon as={FiCheck} mr={1} />
                            Selesai
                          </Badge>
                        </Box>
                      )}
                    </Stack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        )}

        {user && (
          <Box textAlign="center" mt={8}>
            <Button
              variant="outline"
              onClick={() => router.push('/quiz/history')}
            >
              Lihat Riwayat Saya
            </Button>
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default QuizListPage;
