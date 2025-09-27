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
  Alert,
  AlertIcon,
  Radio,
  RadioGroup,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  useToast,
  Center,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
  AspectRatio,
  Tabs,
  TabList,
  TabPanels,
  Tab,
} from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  FiClock,
  FiArrowLeft,
  FiArrowRight,
  FiSend,
  FiPlay,
  FiAward,
  FiUsers,
} from 'react-icons/fi';

import { useQuiz } from '~/lib/context/quizContext';
import useAuth from '~/lib/hooks/useAuth';
import LeaderboardTab from '~/components/quiz/LeaderboardTab';
import HasilSayaTab from '~/components/quiz/HasilSayaTab';
import {
  getQuiz,
  submitQuizAttempt,
  calculateScore,
  getQuizLeaderboard,
  getUserQuizAttempt,
  getUserQuizAttempts,
  getAllQuizzes,
} from '~/lib/services/quizService';
import type { Quiz, QuizAttempt } from '~/lib/types/quiz';

const QuizTakingPage = () => {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const {
    startQuizSession,
    currentSession,
    updateQuizSession,
    endQuizSession,
  } = useQuiz();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>(
    {}
  );
  const [showOverview, setShowOverview] = useState(true);
  const [leaderboard, setLeaderboard] = useState<Array<QuizAttempt & { userName: string }>>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [userAttempt, setUserAttempt] = useState<QuizAttempt | null>(null);
  const [allUserAttempts, setAllUserAttempts] = useState<QuizAttempt[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [userAttemptsLoading, setUserAttemptsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const quizId = params.id as string;
  const currentQuestion =
    quiz?.questions[currentSession?.currentQuestionIndex || 0];
  const isLastQuestion =
    (currentSession?.currentQuestionIndex || 0) ===
    (quiz?.questions.length || 1) - 1;

  // Load quiz and check if user can take it
  useEffect(() => {
    const loadQuiz = async () => {
      if (!user || !quizId) return;

      // Don't reload if we already have the quiz and session for this quiz
      if (quiz && currentSession && currentSession.quizId === quizId) return;

      try {
        setLoading(true);

        // Load quiz
        const fetchedQuiz = await getQuiz(quizId);
        if (!fetchedQuiz) {
          toast({
            title: 'Kuis tidak ditemukan',
            status: 'error',
            duration: 5000,
          });
          router.push('/quiz');
          return;
        }

        setQuiz(fetchedQuiz);

        // Load user's previous attempt if exists
        try {
          const attempt = await getUserQuizAttempt(user.uid, quizId);
          setUserAttempt(attempt);
        } catch (error) {
          // Error loading user attempt
        }

        // Load all user attempts and all quizzes for Hasil Saya tab
        setUserAttemptsLoading(true);
        try {
          const [allAttempts, quizzes] = await Promise.all([
            getUserQuizAttempts(user.uid),
            getAllQuizzes(),
          ]);
          setAllUserAttempts(allAttempts);
          setAllQuizzes(quizzes);
        } catch (error) {
          // Error loading user attempts or quizzes
        } finally {
          setUserAttemptsLoading(false);
        }

        // Load leaderboard
        setLeaderboardLoading(true);
        try {
          const leaderboardData = await getQuizLeaderboard(quizId, 10);
          setLeaderboard(leaderboardData);
        } catch (error) {
          // Error loading leaderboard
        } finally {
          setLeaderboardLoading(false);
        }
      } catch (error) {
        // Error loading quiz
        toast({
          title: 'Error memuat kuis',
          status: 'error',
          duration: 5000,
        });
        router.push('/quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [user, quizId]);

  // Timer effect
  useEffect(() => {
    if (!currentSession || currentSession.isCompleted) return;

    const updateTimer = () => {
      const now = new Date();
      const elapsed = Math.floor(
        (now.getTime() - currentSession.startTime.getTime()) / 1000
      );
      const totalTime = currentSession.timeLimit * 60;
      const remaining = Math.max(0, totalTime - elapsed);

      setTimeLeft(remaining);

      // Auto-submit when time expires
      if (remaining === 0) {
        handleAutoSubmit();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  // Process all user answers into individual question entries
  const processUserAnswers = () => {
    const questionAnswers: Array<{
      id: string;
      quizTitle: string;
      questionTitle: string;
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      options: string[];
      submittedAt: Date;
    }> = [];

    allUserAttempts.forEach((attempt) => {
      const attemptQuiz = allQuizzes.find((q) => q.id === attempt.quizId);
      if (!attemptQuiz) return;

      attemptQuiz.questions.forEach((question) => {
        const userAnswer = attempt.answers[question.id];
        if (userAnswer) {
          questionAnswers.push({
            id: `${attempt.id}_${question.id}`,
            quizTitle: attemptQuiz.title,
            questionTitle: question.title,
            userAnswer,
            correctAnswer: question.answer,
            isCorrect: userAnswer === question.answer,
            options: question.options,
            submittedAt: attempt.submittedAt,
          });
        }
      });
    });

    // Sort by submission date (most recent first)
    return questionAnswers.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  };

  const userQuestionAnswers = processUserAnswers();

  const handleStartQuiz = () => {
    if (!quiz) return;
    setShowOverview(false);
    startQuizSession(quiz);
  };

  const handleAnswerChange = (value: string) => {
    if (!currentQuestion) return;

    const updatedAnswers = {
      ...currentAnswers,
      [currentQuestion.id]: value,
    };

    setCurrentAnswers(updatedAnswers);
    updateQuizSession({ answers: updatedAnswers });
  };

  const handleNextQuestion = () => {
    if (!currentSession || !quiz) return;

    const nextIndex = currentSession.currentQuestionIndex + 1;
    if (nextIndex < quiz.questions.length) {
      updateQuizSession({ currentQuestionIndex: nextIndex });
    }
  };

  const handlePreviousQuestion = () => {
    if (!currentSession) return;

    const prevIndex = currentSession.currentQuestionIndex - 1;
    if (prevIndex >= 0) {
      updateQuizSession({ currentQuestionIndex: prevIndex });
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    await handleSubmitQuiz(true);
  }, []);

  const handleSubmitQuiz = async (autoSubmit = false) => {
    if (!quiz || !user || !currentSession) return;

    try {
      setSubmitting(true);

      const score = calculateScore(currentAnswers, quiz.questions);
      const timeSpent = Math.floor(
        (new Date().getTime() - currentSession.startTime.getTime()) / 1000
      );

      await submitQuizAttempt({
        userId: user.uid,
        quizId: quiz.id,
        score,
        totalQuestions: quiz.questions.length,
        answers: currentAnswers,
        timeSpent,
      });

      updateQuizSession({ isCompleted: true });
      endQuizSession();

      toast({
        title: autoSubmit
          ? 'Waktu habis - Kuis terkirim'
          : 'Kuis berhasil dikirim',
        description: `Skor Anda: ${score}%`,
        status: 'success',
        duration: 5000,
      });

      router.push(`/quiz/${quiz.id}/result`);
    } catch (error) {
      // Error submitting quiz
      toast({
        title: 'Error mengirim kuis',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

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
          Silakan masuk untuk mengikuti kuis ini.
        </Alert>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Kuis tidak ditemukan.
        </Alert>
      </Container>
    );
  }

  const progress = currentSession
    ? ((currentSession.currentQuestionIndex + 1) / quiz.questions.length) * 100
    : 0;
  const answeredQuestions = Object.keys(currentAnswers).length;

  if (showOverview) {
    return (
      <Container maxW="container.lg" py={8}>
        <Stack spacing={8}>
          {/* Quiz Overview Header */}
          <Box textAlign="center">
            <Heading size="lg" mb={2}>
              {quiz.title}
            </Heading>
            {quiz.description && (
              <Text color="gray.600" fontSize="lg">
                {quiz.description}
              </Text>
            )}
          </Box>

          {/* Quiz Info or Completion Card */}
          <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="sm">
            <CardBody>
              {userAttempt ? (
                // Completion Box - User has already taken the quiz
                <Stack spacing={6} textAlign="center">
                  <Box>
                    <Heading size="lg" color="green.500" mb={2}>
                      🎉 Kerja yang baik!
                    </Heading>
                    <Text fontSize="lg" color="gray.600" mb={4}>
                      Usaha yang bagus
                    </Text>
                  </Box>

                  <VStack spacing={4}>
                    <Box>
                      <Text
                        fontSize="3xl"
                        fontWeight="bold"
                        color={
                          userAttempt.score >= 80
                            ? 'green.500'
                            : userAttempt.score >= 60
                              ? 'yellow.500'
                              : 'red.500'
                        }
                      >
                        {userAttempt.score}%
                      </Text>
                      <Text color="gray.600">Skor Anda</Text>
                    </Box>

                    <HStack spacing={8}>
                      <VStack>
                        <Text fontWeight="bold" color="blue.500">
                          Pertanyaan Terjawab
                        </Text>
                        <Text fontSize="lg">
                          {Object.keys(userAttempt.answers).length}/
                          {userAttempt.totalQuestions}
                        </Text>
                      </VStack>

                      <VStack>
                        <Text fontWeight="bold" color="orange.500">
                          Waktu Digunakan
                        </Text>
                        <Text fontSize="lg">
                          {Math.floor(userAttempt.timeSpent / 60)}:
                          {(userAttempt.timeSpent % 60)
                            .toString()
                            .padStart(2, '0')}
                        </Text>
                      </VStack>
                    </HStack>

                    <Button
                      size="lg"
                      colorScheme="blue"
                      leftIcon={<FiPlay />}
                      onClick={handleStartQuiz}
                      px={8}
                      py={6}
                      fontSize="lg"
                      variant="outline"
                    >
                      Ulangi Kuis
                    </Button>
                  </VStack>
                </Stack>
              ) : (
                // Info Box - User hasn't taken the quiz yet
                <Stack spacing={6}>
                  <Heading size="md" textAlign="center" mb={4}>
                    Informasi Kuis
                  </Heading>

                  <VStack spacing={4}>
                    <HStack spacing={8} justify="center">
                      <VStack>
                        <Text fontWeight="bold" color="blue.500">
                          Jumlah Pertanyaan
                        </Text>
                        <Text fontSize="2xl">{quiz.questions.length}</Text>
                      </VStack>

                      <VStack>
                        <Text fontWeight="bold" color="orange.500">
                          Batas Waktu
                        </Text>
                        <Text fontSize="2xl">{quiz.timeLimit} menit</Text>
                      </VStack>

                      <VStack>
                        <Text fontWeight="bold" color="green.500">
                          Tingkat
                        </Text>
                        <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                          {quiz.level}
                        </Badge>
                      </VStack>
                    </HStack>

                    <Button
                      size="lg"
                      colorScheme="blue"
                      leftIcon={<FiPlay />}
                      onClick={handleStartQuiz}
                      px={8}
                      py={6}
                      fontSize="lg"
                    >
                      Mulai Kuis
                    </Button>
                  </VStack>
                </Stack>
              )}
            </CardBody>
          </Card>

          {/* Leaderboard with Tabs */}
          <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="sm">
            <CardBody>
              <Tabs index={tabIndex} onChange={setTabIndex}>
                <TabList>
                  <Tab>
                    <HStack>
                      <FiAward />
                      <Text>Papan Peringkat</Text>
                      <Badge colorScheme="blue" ml={2}>
                        {leaderboard.length}
                      </Badge>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack>
                      <FiUsers />
                      <Text>Hasil Saya</Text>
                      <Badge colorScheme="gray" ml={2}>
                        {userQuestionAnswers.length}
                      </Badge>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Leaderboard Tab */}
                  <LeaderboardTab
                    leaderboard={leaderboard}
                    leaderboardLoading={leaderboardLoading}
                  />

                  {/* My Result Tab - All Individual Questions & Answers */}
                  <HasilSayaTab
                    userQuestionAnswers={userQuestionAnswers}
                    userAttemptsLoading={userAttemptsLoading}
                  />
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Stack spacing={6}>
        {/* Header */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Box>
              <Heading size="md">{quiz.title}</Heading>
              <Text color="gray.600" fontSize="sm">
                Pertanyaan {currentSession.currentQuestionIndex + 1} dari{' '}
                {quiz.questions.length}
              </Text>
            </Box>

            <VStack align="end" spacing={2}>
              <HStack>
                <FiClock />
                <Text
                  fontWeight="bold"
                  color={timeLeft < 60 ? 'red.500' : 'blue.500'}
                >
                  {formatTime(timeLeft)}
                </Text>
              </HStack>
              <Badge colorScheme="blue">
                {answeredQuestions}/{quiz.questions.length} terjawab
              </Badge>
            </VStack>
          </HStack>

          <Progress value={progress} colorScheme="blue" />
        </Box>

        {/* Question Card */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="sm">
          <CardBody>
            <Stack spacing={6}>
              <Box>
                <Heading size="sm" mb={4}>
                  {currentQuestion?.title}
                </Heading>

                {/* Media (if available) */}
                {currentQuestion?.media && (
                  <Box mb={4}>
                    {currentQuestion.media.includes('youtube.com') ||
                    currentQuestion.media.includes('youtu.be') ? (
                      <AspectRatio ratio={16 / 9} maxW="500px">
                        <iframe
                          src={currentQuestion.media.replace(
                            'watch?v=',
                            'embed/'
                          )}
                          title="Quiz media"
                          allowFullScreen
                        />
                      </AspectRatio>
                    ) : (
                      <Image
                        src={currentQuestion.media}
                        alt="Quiz question media"
                        maxW="500px"
                        borderRadius="md"
                      />
                    )}
                  </Box>
                )}
              </Box>

              <RadioGroup
                value={currentAnswers[currentQuestion?.id || ''] || ''}
                onChange={handleAnswerChange}
              >
                <VStack align="stretch" spacing={3}>
                  {currentQuestion?.options.map((option, index) => (
                    <Radio
                      key={`question-${currentQuestionIndex}-option-${index}`}
                      value={String.fromCharCode(65 + index)}
                      size="lg"
                    >
                      <Text ml={2}>
                        {String.fromCharCode(65 + index)}. {option}
                      </Text>
                    </Radio>
                  ))}
                </VStack>
              </RadioGroup>
            </Stack>
          </CardBody>
        </Card>

        {/* Navigation */}
        <HStack justify="space-between">
          <Button
            leftIcon={<FiArrowLeft />}
            onClick={handlePreviousQuestion}
            isDisabled={currentSession.currentQuestionIndex === 0}
            variant="outline"
          >
            Sebelumnya
          </Button>

          <HStack spacing={3}>
            {isLastQuestion ? (
              <Button
                colorScheme="green"
                leftIcon={<FiSend />}
                onClick={onOpen}
                isDisabled={answeredQuestions === 0}
              >
                Kirim Kuis
              </Button>
            ) : (
              <Button
                rightIcon={<FiArrowRight />}
                onClick={handleNextQuestion}
                colorScheme="blue"
              >
                Selanjutnya
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Time warning */}
        {timeLeft > 0 && timeLeft < 300 && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Peringatan Waktu</Text>
              <Text>
                Kurang dari 5 menit tersisa. Silakan periksa jawaban Anda.
              </Text>
            </Box>
          </Alert>
        )}
      </Stack>

      {/* Submit Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Kirim Kuis</ModalHeader>
          <ModalBody>
            <Stack spacing={4}>
              <Text>Apakah Anda yakin ingin mengirim kuis Anda?</Text>
              <Box>
                <Text>
                  <strong>Terjawab:</strong> {answeredQuestions} dari{' '}
                  {quiz.questions.length} pertanyaan
                </Text>
                <Text>
                  <strong>Waktu digunakan:</strong>{' '}
                  {formatTime(quiz.timeLimit * 60 - timeLeft)}
                </Text>
              </Box>
              {answeredQuestions < quiz.questions.length && (
                <Alert status="warning" size="sm">
                  <AlertIcon />
                  Anda memiliki pertanyaan yang belum dijawab. Mereka akan
                  ditandai sebagai salah.
                </Alert>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Batal
            </Button>
            <Button
              colorScheme="green"
              onClick={() => handleSubmitQuiz()}
              isLoading={submitting}
            >
              Kirim Kuis
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default QuizTakingPage;
