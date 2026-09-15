'use client';

import {
  Badge,
  Box,
  Button,
  Center,
  HStack,
  Heading,
  Progress,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

import { setBestScore, getLevelProgress } from '~/lib/belajar/progress';
import type { LevelId, ModulId, Soal } from '~/lib/types/belajar';

type Phase = 'loading' | 'quiz' | 'done' | 'error';

function resultTitle(pct: number): string {
  if (pct >= 80) return '🎉 Hebat!';
  if (pct >= 50) return '👍 Bagus!';
  return '💪 Coba lagi!';
}

export default function QuizPlayer({
  modulId,
  level,
}: {
  modulId: ModulId;
  level: LevelId;
}) {
  const [soal, setSoal] = useState<Soal[]>([]);
  const [phase, setPhase] = useState<Phase>('loading');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [best, setBest] = useState<number | null>(null);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const optionBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  const load = useCallback(async () => {
    setPhase('loading');
    setIdx(0);
    setAnswers({});
    try {
      const res = await fetch('/api/belajar/soal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modul: modulId, level, jumlah: 10 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { soal?: Soal[] };
      if (!data.soal || data.soal.length === 0) throw new Error('kosong');
      setSoal(data.soal);
      setPhase('quiz');
    } catch {
      setPhase('error');
    }
  }, [modulId, level]);

  useEffect(() => {
    setBest(getLevelProgress(modulId, level).bestScore ?? null);
    load();
  }, [modulId, level, load]);

  const answer = (pilihan: number) => {
    if (answers[idx] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [idx]: pilihan }));
  };

  const next = () => {
    if (idx < soal.length - 1) {
      setIdx(idx + 1);
      return;
    }
    const score = soal.reduce(
      (acc, s, i) => acc + (answers[i] === s.jawaban ? 1 : 0),
      0
    );
    setBestScore(modulId, level, score, soal.length);
    setBest((prev) => (prev == null || score > prev ? score : prev));
    setPhase('done');
  };

  if (phase === 'loading') {
    return (
      <Center py={10}>
        <VStack spacing={3}>
          <Spinner size="lg" color="purple.500" />
          <Text fontSize="sm" color="gray.500">
            Menyiapkan soal...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (phase === 'error') {
    return (
      <Center py={10}>
        <VStack spacing={3}>
          <Text fontSize="sm" color="gray.500">
            Gagal memuat soal.
          </Text>
          <Button size="sm" colorScheme="purple" onClick={load}>
            Coba Lagi
          </Button>
        </VStack>
      </Center>
    );
  }

  if (phase === 'done') {
    const score = soal.reduce(
      (acc, s, i) => acc + (answers[i] === s.jawaban ? 1 : 0),
      0
    );
    const pct = Math.round((score / soal.length) * 100);
    return (
      <Center py={8}>
        <VStack spacing={4} textAlign="center">
          <Heading size="lg">{resultTitle(pct)}</Heading>
          <Text fontSize="2xl" fontWeight="bold" color="purple.500">
            {score} / {soal.length}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Nilai: {pct}
            {best != null ? ` · Terbaik: ${best}/${soal.length}` : ''}
          </Text>
          <HStack>
            <Button colorScheme="purple" onClick={load}>
              Ulangi (soal baru)
            </Button>
          </HStack>
        </VStack>
      </Center>
    );
  }

  const s = soal[idx];
  const chosen = answers[idx];
  const answered = chosen !== undefined;

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <HStack justify="space-between" mb={1}>
          <Text fontSize="xs" color="gray.500">
            Soal {idx + 1} dari {soal.length}
          </Text>
          {best != null && (
            <Badge colorScheme="purple" variant="subtle" fontSize="10px">
              Terbaik: {best}/{soal.length}
            </Badge>
          )}
        </HStack>
        <Progress
          value={((idx + 1) / soal.length) * 100}
          size="sm"
          borderRadius="full"
          colorScheme="purple"
        />
      </Box>

      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        p={{ base: 4, sm: 6 }}
        boxShadow="sm"
      >
        <Heading size="sm" mb={4}>
          {s.pertanyaan}
        </Heading>
        <VStack align="stretch" spacing={2}>
          {s.pilihan.map((p, i) => {
            const isCorrect = i === s.jawaban;
            const isChosen = chosen === i;
            let bg = optionBg;
            if (answered && isCorrect) bg = 'green.100';
            else if (answered && isChosen) bg = 'red.100';
            return (
              <Button
                key={p}
                onClick={() => answer(i)}
                justifyContent="flex-start"
                whiteSpace="normal"
                h="auto"
                py={3}
                px={4}
                bg={bg}
                borderRadius="lg"
                fontWeight="normal"
                isDisabled={answered}
                _hover={answered ? {} : { bg: 'purple.50' }}
              >
                <Text fontSize="sm" textAlign="left">
                  <b>{String.fromCharCode(65 + i)}.</b> {p}
                </Text>
              </Button>
            );
          })}
        </VStack>

        {answered && (
          <Box
            mt={4}
            p={3}
            borderRadius="lg"
            bg={chosen === s.jawaban ? 'green.50' : 'red.50'}
          >
            <Text fontSize="sm" fontWeight="bold">
              {chosen === s.jawaban ? 'Benar! ✅' : 'Belum tepat ❌'}
            </Text>
            {s.pembahasan && (
              <Text fontSize="xs" mt={1} color="gray.600">
                {s.pembahasan}
              </Text>
            )}
          </Box>
        )}
      </Box>

      <HStack justify="flex-end">
        <Button
          size="sm"
          colorScheme="purple"
          onClick={next}
          isDisabled={!answered}
        >
          {idx < soal.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil'}
        </Button>
      </HStack>
    </VStack>
  );
}
