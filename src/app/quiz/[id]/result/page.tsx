/* eslint-disable react/no-array-index-key */

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
  Progress,
  Badge,
  HStack,
  VStack,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
  Alert,
  AlertIcon,
  Center,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiHome,
} from 'react-icons/fi';

import useAuth from '~/lib/hooks/useAuth';
import { getQuiz, getUserQuizAttempt } from '~/lib/services/quizService';
import type { Quiz, QuizAttempt } from '~/lib/types/quiz';

const QuizResultPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const correctBg = useColorModeValue('green.50', 'green.900');
  const incorrectBg = useColorModeValue('red.50', 'red.900');

  const quizId = params.id as string;

  useEffect(() => {
    const loadResults = async () => {
      if (!user || !quizId) return;

      try {
        setLoading(true);

        const [fetchedQuiz, userAttempt] = await Promise.all([
          getQuiz(quizId),
          getUserQuizAttempt(user.uid, quizId),
        ]);

        if (!fetchedQuiz) {
          router.push('/quiz');
          return;
        }

        if (!userAttempt) {
          router.push(`/quiz/${quizId}`);
          return;
        }

        setQuiz(fetchedQuiz);
        setAttempt(userAttempt);
      } catch {
        router.push('/quiz');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [user, quizId, router]);

  if (loading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Center minH="400px">
          <Spinner size="xl" />
        </Center>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          Silakan masuk untuk melihat hasil Anda.
        </Alert>
      </Container>
    );
  }

  if (!quiz || !attempt) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Hasil tidak ditemukan.
        </Alert>
      </Container>
    );
  }

  const correctAnswers = quiz.questions.filter(
    (question) => attempt.answers[question.id] === question.answer
  ).length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Luar biasa! Kinerja yang sangat baik!';
    if (score >= 80) return 'Bagus sekali! Kerja yang baik!';
    if (score >= 70) return 'Kerja yang baik! Usaha yang bagus!';
    if (score >= 60) return 'Tidak buruk! Masih bisa ditingkatkan.';
    return 'Terus belajar dan coba lagi lain kali!';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Stack spacing={8}>
        {/* Header */}
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            Hasil Kuis
          </Heading>
          <Text color="gray.600">{quiz.title}</Text>
        </Box>

        {/* Score Summary */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="lg">
          <CardBody>
            <VStack spacing={6}>
              <Box textAlign="center">
                <Text
                  fontSize="6xl"
                  fontWeight="bold"
                  color={`${getScoreColor(attempt.score)}.500`}
                >
                  {attempt.score}%
                </Text>
                <Text fontSize="lg" color="gray.600">
                  {getScoreMessage(attempt.score)}
                </Text>
              </Box>

              <Progress
                value={attempt.score}
                colorScheme={getScoreColor(attempt.score)}
                size="lg"
                width="100%"
                borderRadius="md"
              />

              <HStack
                spacing={8}
                divider={
                  <Box borderLeft="1px" borderColor={borderColor} h="40px" />
                }
              >
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {correctAnswers}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Benar
                  </Text>
                </VStack>

                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="red.500">
                    {quiz.questions.length - correctAnswers}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Salah
                  </Text>
                </VStack>

                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    {quiz.questions.length}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Total
                  </Text>
                </VStack>

                <VStack>
                  <Flex align="center" gap={1}>
                    <Icon as={FiClock} />
                    <Text fontSize="2xl" fontWeight="bold">
                      {formatDuration(attempt.timeSpent)}
                    </Text>
                  </Flex>
                  <Text fontSize="sm" color="gray.600">
                    Waktu Digunakan
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={4}>
                <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                  Tingkat: {quiz.level}
                </Badge>
                <Badge colorScheme="gray" px={3} py={1} borderRadius="full">
                  Selesai: {format(attempt.submittedAt, 'MMM dd, yyyy HH:mm')}
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Detailed Results */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4}>
              Hasil Detail
            </Heading>

            <Accordion allowToggle>
              {quiz.questions.map((question, index) => {
                const userAnswer = attempt.answers[question.id];
                const isCorrect = userAnswer === question.answer;
                const wasAnswered = Boolean(userAnswer);

                return (
                  <AccordionItem key={question.id} border="none" mb={2}>
                    <AccordionButton
                      bg={isCorrect ? correctBg : incorrectBg}
                      border="1px"
                      borderColor={isCorrect ? 'green.200' : 'red.200'}
                      borderRadius="md"
                      _hover={{
                        bg: isCorrect ? 'green.100' : 'red.100',
                      }}
                      p={4}
                    >
                      <Flex flex="1" textAlign="left" align="center">
                        <Icon
                          as={isCorrect ? FiCheckCircle : FiXCircle}
                          color={isCorrect ? 'green.500' : 'red.500'}
                          mr={3}
                        />
                        <Box flex="1">
                          <Text fontWeight="medium">
                            Pertanyaan {index + 1}: {question.title}
                          </Text>
                          {!wasAnswered && (
                            <Text fontSize="sm" color="red.500" mt={1}>
                              Tidak dijawab
                            </Text>
                          )}
                        </Box>
                        <Badge colorScheme={isCorrect ? 'green' : 'red'} mr={2}>
                          {isCorrect ? 'Benar' : 'Salah'}
                        </Badge>
                      </Flex>
                      <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel pb={4}>
                      <Stack spacing={4}>
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Pilihan:
                          </Text>
                          <VStack align="stretch" spacing={2}>
                            {question.options.map((option, optionIndex) => {
                              const optionLetter = String.fromCharCode(
                                65 + optionIndex
                              );
                              const isUserAnswer = userAnswer === optionLetter;
                              const isCorrectAnswer =
                                question.answer === optionLetter;

                              return (
                                // eslint-disable-next-line react/no-array-index-key
                                <Box
                                  key={`result-question-${question.id}-option-${optionIndex}`}
                                  p={2}
                                  borderRadius="md"
                                  bg={
                                    // eslint-disable-next-line no-nested-ternary
                                    isCorrectAnswer
                                      ? correctBg
                                      : isUserAnswer
                                        ? incorrectBg
                                        : 'transparent'
                                  }
                                  border="1px"
                                  borderColor={
                                    // eslint-disable-next-line no-nested-ternary
                                    isCorrectAnswer
                                      ? 'green.200'
                                      : isUserAnswer
                                        ? 'red.200'
                                        : borderColor
                                  }
                                >
                                  <Flex align="center">
                                    <Text fontWeight="medium" mr={2}>
                                      {optionLetter}.
                                    </Text>
                                    <Text flex="1">{option}</Text>
                                    {isCorrectAnswer && (
                                      <Badge colorScheme="green" size="sm">
                                        Jawaban Benar
                                      </Badge>
                                    )}
                                    {isUserAnswer && !isCorrectAnswer && (
                                      <Badge colorScheme="red" size="sm">
                                        Jawaban Anda
                                      </Badge>
                                    )}
                                  </Flex>
                                </Box>
                              );
                            })}
                          </VStack>
                        </Box>

                        {!wasAnswered && (
                          <Alert status="warning" size="sm">
                            <AlertIcon />
                            Anda tidak menjawab pertanyaan ini.
                          </Alert>
                        )}
                      </Stack>
                    </AccordionPanel>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardBody>
        </Card>

        {/* Actions */}
        <HStack justify="center" spacing={4}>
          <Button
            leftIcon={<FiHome />}
            onClick={() => router.push('/quiz')}
            variant="outline"
          >
            Kembali ke Daftar Kuis
          </Button>

          <Button
            leftIcon={<FiTrendingUp />}
            onClick={() => router.push('/quiz/history')}
            colorScheme="blue"
          >
            Lihat Semua Hasil
          </Button>
        </HStack>
      </Stack>
    </Container>
  );
};

export default QuizResultPage;
