import type { Quiz, QuizAttempt } from '~/lib/types/quiz';

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function processUserAnswers(
  allUserAttempts: QuizAttempt[],
  allQuizzes: Quiz[]
) {
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
}
