import { describe, expect, it } from 'vitest';

import type { Question } from '~/lib/types/quiz';

import { calculateScore, generateQuestionId } from './quizService';

const questions: Question[] = [
  {
    id: 'q1',
    title: 'P1',
    options: ['A', 'B', 'C', 'D'],
    answer: 'A',
    level: 'Beginner',
    media: '',
  },
  {
    id: 'q2',
    title: 'P2',
    options: ['A', 'B', 'C', 'D'],
    answer: 'B',
    level: 'Beginner',
    media: '',
  },
  {
    id: 'q3',
    title: 'P3',
    options: ['A', 'B', 'C', 'D'],
    answer: 'C',
    level: 'Beginner',
    media: '',
  },
  {
    id: 'q4',
    title: 'P4',
    options: ['A', 'B', '0', 'D'],
    answer: 'D',
    level: 'Beginner',
    media: '',
  },
];

describe('quizService#calculateScore', () => {
  it('100 saat semua benar', () => {
    expect(
      calculateScore({ q1: 'A', q2: 'B', q3: 'C', q4: 'D' }, questions)
    ).toBe(100);
  });

  it('50 saat separuh benar', () => {
    expect(
      calculateScore({ q1: 'A', q2: 'X', q3: 'C', q4: 'X' }, questions)
    ).toBe(50);
  });

  it('0 saat semua salah / kosong', () => {
    expect(calculateScore({}, questions)).toBe(0);
    expect(
      calculateScore({ q1: 'B', q2: 'A', q3: 'D', q4: 'C' }, questions)
    ).toBe(0);
  });

  it('membulatkan persentase', () => {
    expect(calculateScore({ q1: 'A', q2: 'B' }, questions)).toBe(50);
  });
});

describe('quizService#generateQuestionId', () => {
  it('diawali q_ dan unik untuk banyak pemanggilan', () => {
    const ids = new Set(
      Array.from({ length: 200 }, () => generateQuestionId())
    );
    expect(ids.size).toBe(200);
    ids.forEach((id) => expect(id.startsWith('q_')).toBe(true));
  });
});
