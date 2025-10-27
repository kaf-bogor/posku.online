'use client';

import type React from 'react';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import useAuth from '~/lib/hooks/useAuth';
import { getAllQuizzes, getUserQuizAttempts } from '~/lib/services/quizService';
import type { Quiz, QuizAttempt, QuizSession } from '~/lib/types/quiz';

interface QuizContextType {
  quizzes: Quiz[];
  userAttempts: QuizAttempt[];
  currentSession: QuizSession | null;
  loading: boolean;
  error: string | null;
  loadQuizzes: () => Promise<void>;
  loadUserAttempts: () => Promise<void>;
  startQuizSession: (quiz: Quiz) => void;
  updateQuizSession: (updates: Partial<QuizSession>) => void;
  endQuizSession: () => void;
  hasAttempted: (quizId: string) => boolean;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

interface QuizProviderProps {
  children: React.ReactNode;
}

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userAttempts, setUserAttempts] = useState<QuizAttempt[]>([]);
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedQuizzes = await getAllQuizzes();
      setQuizzes(fetchedQuizzes);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load quizzes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserAttempts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const attempts = await getUserQuizAttempts(user.uid);
      setUserAttempts(attempts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load user attempts';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const startQuizSession = useCallback((quiz: Quiz) => {
    const session: QuizSession = {
      quizId: quiz.id,
      startTime: new Date(),
      timeLimit: quiz.timeLimit,
      currentQuestionIndex: 0,
      answers: {},
      isCompleted: false,
    };
    setCurrentSession(session);
  }, []);

  const updateQuizSession = useCallback((updates: Partial<QuizSession>) => {
    setCurrentSession((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const endQuizSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  const hasAttempted = useCallback(
    (quizId: string) => {
      return userAttempts.some((attempt) => attempt.quizId === quizId);
    },
    [userAttempts]
  );

  // Load quizzes on mount
  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  // Load user attempts when user changes
  useEffect(() => {
    if (user) {
      loadUserAttempts();
    } else {
      setUserAttempts([]);
    }
  }, [user, loadUserAttempts]);

  const value: QuizContextType = useMemo(
    () => ({
      quizzes,
      userAttempts,
      currentSession,
      loading,
      error,
      loadQuizzes,
      loadUserAttempts,
      startQuizSession,
      updateQuizSession,
      endQuizSession,
      hasAttempted,
    }),
    [
      quizzes,
      userAttempts,
      currentSession,
      loading,
      error,
      loadQuizzes,
      loadUserAttempts,
      startQuizSession,
      updateQuizSession,
      endQuizSession,
      hasAttempted,
    ]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
