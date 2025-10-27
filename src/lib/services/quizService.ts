/* eslint-disable no-useless-catch */
/* eslint-disable sonarjs/no-useless-catch */
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

import { db } from '~/lib/firebase';
import type {
  Quiz,
  Question,
  QuizAttempt,
  User,
  QuizFormData,
} from '~/lib/types/quiz';

// Collections
const USERS_COLLECTION = 'users';
const QUIZZES_COLLECTION = 'quizzes';
const QUIZ_ATTEMPTS_COLLECTION = 'quiz_attempts';

// User operations
export const saveUserProfile = async (user: Omit<User, 'createdAt'>) => {
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
    });
  }
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: userDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as User;
    }
    return null;
  } catch (error) {
    // Error getting user profile
    throw error;
  }
};

// Quiz operations
export const createQuiz = async (
  quizData: QuizFormData,
  createdBy: string
): Promise<string> => {
  try {
    const batch = writeBatch(db);

    // Create quiz document
    const quizRef = doc(collection(db, QUIZZES_COLLECTION));
    const quiz: Omit<Quiz, 'id'> = {
      ...quizData,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
    };

    batch.set(quizRef, {
      ...quiz,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
    return quizRef.id;
  } catch (error) {
    // Error creating quiz
    throw error;
  }
};

export const updateQuiz = async (
  quizId: string,
  quizData: Partial<QuizFormData>
): Promise<void> => {
  try {
    const quizRef = doc(db, QUIZZES_COLLECTION, quizId);
    await updateDoc(quizRef, {
      ...quizData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // Error updating quiz
    throw error;
  }
};

export const deleteQuiz = async (quizId: string): Promise<void> => {
  try {
    const quizRef = doc(db, QUIZZES_COLLECTION, quizId);
    await deleteDoc(quizRef);
  } catch (error) {
    // Error deleting quiz
    throw error;
  }
};

export const getQuiz = async (quizId: string): Promise<Quiz | null> => {
  try {
    const quizRef = doc(db, QUIZZES_COLLECTION, quizId);
    const quizDoc = await getDoc(quizRef);

    if (quizDoc.exists()) {
      const data = quizDoc.data();
      return {
        id: quizDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Quiz;
    }
    return null;
  } catch (error) {
    // Error getting quiz
    throw error;
  }
};

export const getAllQuizzes = async (): Promise<Quiz[]> => {
  try {
    const quizzesQuery = query(
      collection(db, QUIZZES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(quizzesQuery);

    return querySnapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Quiz;
    });
  } catch (error) {
    // Error getting quizzes
    throw error;
  }
};

export const getQuizzesByLevel = async (level: string): Promise<Quiz[]> => {
  try {
    const quizzesQuery = query(
      collection(db, QUIZZES_COLLECTION),
      where('level', '==', level),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(quizzesQuery);

    return querySnapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Quiz;
    });
  } catch (error) {
    // Error getting quizzes by level
    throw error;
  }
};

// Quiz attempt operations
export const submitQuizAttempt = async (
  attempt: Omit<QuizAttempt, 'id' | 'submittedAt'>
): Promise<string> => {
  try {
    const attemptRef = await addDoc(collection(db, QUIZ_ATTEMPTS_COLLECTION), {
      ...attempt,
      submittedAt: serverTimestamp(),
    });
    return attemptRef.id;
  } catch (error) {
    // Error submitting quiz attempt
    throw error;
  }
};

export const getUserQuizAttempt = async (
  userId: string,
  quizId: string
): Promise<QuizAttempt | null> => {
  try {
    const attemptQuery = query(
      collection(db, QUIZ_ATTEMPTS_COLLECTION),
      where('userId', '==', userId),
      where('quizId', '==', quizId),
      limit(1)
    );
    const querySnapshot = await getDocs(attemptQuery);

    if (!querySnapshot.empty) {
      const attemptDoc = querySnapshot.docs[0];
      const data = attemptDoc.data();
      return {
        id: attemptDoc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate() || new Date(),
      } as QuizAttempt;
    }
    return null;
  } catch (error) {
    // Error getting user quiz attempt
    throw error;
  }
};

export const getUserQuizAttempts = async (
  userId: string
): Promise<QuizAttempt[]> => {
  try {
    const attemptsQuery = query(
      collection(db, QUIZ_ATTEMPTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );
    const querySnapshot = await getDocs(attemptsQuery);

    return querySnapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...data,
        submittedAt: data.submittedAt?.toDate() || new Date(),
      } as QuizAttempt;
    });
  } catch (error) {
    // Error getting user quiz attempts
    throw error;
  }
};

export const getQuizAttempts = async (
  quizId: string
): Promise<QuizAttempt[]> => {
  try {
    const attemptsQuery = query(
      collection(db, QUIZ_ATTEMPTS_COLLECTION),
      where('quizId', '==', quizId),
      orderBy('submittedAt', 'desc')
    );
    const querySnapshot = await getDocs(attemptsQuery);

    return querySnapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...data,
        submittedAt: data.submittedAt?.toDate() || new Date(),
      } as QuizAttempt;
    });
  } catch (error) {
    // Error getting quiz attempts
    throw error;
  }
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
    const attemptsQuery = query(
      collection(db, QUIZ_ATTEMPTS_COLLECTION),
      where('quizId', '==', quizId),
      orderBy('score', 'desc'),
      limit(maxResults)
    );
    const querySnapshot = await getDocs(attemptsQuery);

    const attempts: Array<QuizAttempt & { userName: string }> =
      await Promise.all(
        querySnapshot.docs.map(async (attemptDoc) => {
          const attemptData = attemptDoc.data();
          const attempt = {
            id: attemptDoc.id,
            ...attemptData,
            submittedAt: attemptData.submittedAt?.toDate() || new Date(),
          } as QuizAttempt;

          // Get user name
          let userName = 'Unknown User';
          try {
            const userDoc = await getDoc(
              doc(db, USERS_COLLECTION, attempt.userId)
            );
            if (userDoc.exists()) {
              userName =
                userDoc.data().displayName ||
                userDoc.data().email ||
                'Unknown User';
            }
          } catch {
            // Error getting user data
          }

          return {
            ...attempt,
            userName,
          };
        })
      );

    // Sort by score descending, then by time spent ascending (faster time wins)
    attempts.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score; // Higher score wins
      }
      return a.timeSpent - b.timeSpent; // Faster time wins for same score
    });

    return attempts;
  } catch (error) {
    // Error getting quiz leaderboard
    throw error;
  }
};
