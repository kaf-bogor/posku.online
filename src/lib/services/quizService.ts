/* eslint-disable no-useless-catch */
/* eslint-disable sonarjs/no-useless-catch */
import { D1_API_URL } from '../config/d1';
import type {
  Quiz,
  Question,
  QuizAttempt,
  User,
  QuizFormData,
} from '~/lib/types/quiz';

async function getToken(): Promise<string | null> {
  try {
    const { getAuth } = await import('firebase/auth');
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown } = {}
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const res = await fetch(`${D1_API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore body parse error
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

const toDate = (v?: string | null): Date => (v ? new Date(v) : new Date(0));

const toQuiz = (q: Record<string, unknown>): Quiz =>
  ({
    ...q,
    createdAt: toDate(q.createdAt as string | undefined),
    updatedAt: toDate(q.updatedAt as string | undefined),
  }) as unknown as Quiz;

const toAttempt = (a: Record<string, unknown>): QuizAttempt =>
  ({
    ...a,
    submittedAt: toDate(a.submittedAt as string | undefined),
  }) as unknown as QuizAttempt;

interface QuizListResponse {
  data: Quiz[];
}

// User operations (profil user di D1 belum dipakai; dipertahankan sbg no-op)
export const saveUserProfile = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  user: Omit<User, 'createdAt'>
): Promise<void> => {
  // Profil user saat ini tetap dikelola Firebase Auth + fs_admin (untuk admin).
};

export const getUserProfile = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uid: string
): Promise<User | null> => {
  return null;
};

// Quiz operations
export const createQuiz = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  quizData: QuizFormData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createdBy: string
): Promise<string> => {
  throw new Error('createQuiz belum tersedia di D1.');
};

export const updateQuiz = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  quizId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  quizData: Partial<QuizFormData>
): Promise<void> => {
  throw new Error('updateQuiz belum tersedia di D1.');
};

export const deleteQuiz = async (quizId: string): Promise<void> => {
  const token = await getToken();
  await request<{ ok: boolean }>(`/api/quizzes/${encodeURIComponent(quizId)}`, {
    method: 'DELETE',
    token,
  });
};

export const getQuiz = async (quizId: string): Promise<Quiz | null> => {
  try {
    const data = await request<Quiz>(
      `/api/quizzes/${encodeURIComponent(quizId)}`
    );
    return toQuiz(data as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
};

export const getAllQuizzes = async (): Promise<Quiz[]> => {
  const res = await request<QuizListResponse>('/api/quizzes');
  return (res.data ?? []).map((q) =>
    toQuiz(q as unknown as Record<string, unknown>)
  );
};

export const getQuizzesByLevel = async (level: string): Promise<Quiz[]> => {
  const quizzes = await getAllQuizzes();
  return quizzes.filter((q) => q.level === level);
};

// Quiz attempt operations
export const submitQuizAttempt = async (
  attempt: Omit<QuizAttempt, 'id' | 'submittedAt'>
): Promise<string> => {
  const token = await getToken();
  const res = await request<{ id: string }>(
    `/api/quizzes/${encodeURIComponent(attempt.quizId)}/attempts`,
    {
      method: 'POST',
      token,
      body: {
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        answers: attempt.answers,
        timeSpent: attempt.timeSpent,
      },
    }
  );
  return res.id;
};

export const getUserQuizAttempt = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId: string,
  quizId: string
): Promise<QuizAttempt | null> => {
  try {
    const token = await getToken();
    const data = await request<QuizAttempt>(
      `/api/quizzes/${encodeURIComponent(quizId)}/attempt`,
      { token }
    );
    return toAttempt(data as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
};

export const getUserQuizAttempts = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId: string
): Promise<QuizAttempt[]> => {
  const token = await getToken();
  const res = await request<{ data: QuizAttempt[] }>('/api/quizzes/attempts', {
    token,
  });
  return (res.data ?? []).map((a) =>
    toAttempt(a as unknown as Record<string, unknown>)
  );
};

export const getQuizAttempts = async (
  quizId: string
): Promise<QuizAttempt[]> => {
  const token = await getToken();
  const res = await request<{ data: QuizAttempt[] }>(
    `/api/quizzes/${encodeURIComponent(quizId)}/attempts`,
    { token }
  );
  return (res.data ?? []).map((a) =>
    toAttempt(a as unknown as Record<string, unknown>)
  );
};

// Utility functions
export const calculateScore = (
  answers: Record<string, string>,
  questions: Question[]
): number => {
  let correct = 0;
  questions.forEach((question) => {
    if (answers[question.id] === question.answer) {
      correct += 1;
    }
  });
  return Math.round((correct / questions.length) * 100);
};

export const hasUserAttemptedQuiz = async (
  userId: string,
  quizId: string
): Promise<boolean> => {
  const attempt = await getUserQuizAttempt(userId, quizId);
  return attempt !== null;
};

export const generateQuestionId = (): string => {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get leaderboard for a specific quiz
export const getQuizLeaderboard = async (
  quizId: string,
  maxResults: number = 10
): Promise<Array<QuizAttempt & { userName: string }>> => {
  try {
    const token = await getToken();
    const res = await request<{
      data: Array<QuizAttempt & { userName: string }>;
    }>(
      `/api/quizzes/${encodeURIComponent(quizId)}/leaderboard?limit=${maxResults}`,
      {
        token,
      }
    );

    const attempts = (res.data ?? []).map((entry) => ({
      ...toAttempt(entry as unknown as Record<string, unknown>),
      userName: entry.userName || 'Unknown User',
    }));

    // Sort by score descending, then by time spent ascending (faster time wins)
    attempts.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score; // Higher score wins
      }
      return a.timeSpent - b.timeSpent; // Faster time wins for same score
    });

    return attempts.slice(0, maxResults);
  } catch (error) {
    // Error getting quiz leaderboard
    throw error;
  }
};
