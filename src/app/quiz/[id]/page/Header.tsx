'use client';

import {
  Box,
  HStack,
  Heading,
  VStack,
  Badge,
  Progress,
  Text,
} from '@chakra-ui/react';
import { FiClock } from 'react-icons/fi';

import { formatTime } from '../utils';
import type { QuizSession, Quiz } from '~/lib/types/quiz';

export default function Header({
  currentSession,
  quiz,
  timeLeft,
  answeredQuestions,
  progress,
}: {
  currentSession: QuizSession;
  quiz: Quiz;
  timeLeft: number;
  answeredQuestions: number;
  progress: number;
}) {
  return (
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
  );
}
