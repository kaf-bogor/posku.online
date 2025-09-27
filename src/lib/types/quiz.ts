export interface Question {
  id: string;
  title: string;
  options: string[]; // A, B, C, D options
  answer: string; // Correct answer (A, B, C, or D)
  level: string;
  media?: string; // Optional image, YouTube URL, or Google Drive link
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  level: string;
  timeLimit: number; // in minutes, default 3
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // admin userId
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, string>; // questionId -> selectedAnswer
  submittedAt: Date;
  timeSpent: number; // in seconds
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  role?: 'admin' | 'user'; // admin role for quiz management
}

export interface QuizSession {
  quizId: string;
  startTime: Date;
  timeLimit: number; // in minutes
  currentQuestionIndex: number;
  answers: Record<string, string>;
  isCompleted: boolean;
}

export interface QuizStats {
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
}

export interface QuestionImport {
  title: string;
  options: string[];
  answer: string;
  level: string;
  media?: string;
}

export interface QuizFormData {
  title: string;
  description: string;
  level: string;
  timeLimit: number;
  questions: Question[];
}
