'use client';

import {
  Box,
  Button,
  HStack,
  Heading,
  Progress,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { getLevelProgress, setLastStep } from '~/lib/belajar/progress';
import type { LevelId, MateriStep, ModulId } from '~/lib/types/belajar';

import MathVisual from './MathVisual';

export default function LessonPlayer({
  steps,
  modulId,
  level,
  isMath,
  onPractice,
}: {
  steps: MateriStep[];
  modulId: ModulId;
  level: LevelId;
  isMath: boolean;
  onPractice?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const chipBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const tipBg = useColorModeValue('yellow.50', 'whiteAlpha.100');

  useEffect(() => {
    const saved = getLevelProgress(modulId, level).lastStep ?? 0;
    setIdx(Math.min(saved, Math.max(steps.length - 1, 0)));
  }, [modulId, level, steps.length]);

  if (steps.length === 0) {
    return (
      <Text color="gray.500" fontSize="sm">
        Materi untuk level ini belum tersedia.
      </Text>
    );
  }

  const step = steps[Math.min(idx, steps.length - 1)];
  const isLast = idx >= steps.length - 1;

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(next, steps.length - 1));
    setIdx(clamped);
    setLastStep(modulId, level, clamped);
  };

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <HStack justify="space-between" mb={1}>
          <Text fontSize="xs" color="gray.500">
            Langkah {idx + 1} dari {steps.length}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {Math.round(((idx + 1) / steps.length) * 100)}%
          </Text>
        </HStack>
        <Progress
          value={((idx + 1) / steps.length) * 100}
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
        <Heading size="md" mb={2}>
          {step.title}
        </Heading>
        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
          {step.body}
        </Text>

        {step.contoh && step.contoh.length > 0 && (
          <VStack align="stretch" spacing={2} mt={4}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500">
              Contoh
            </Text>
            {step.contoh.map((c) =>
              isMath ? (
                <MathVisual key={c} line={c} />
              ) : (
                <Box
                  key={c}
                  bg={chipBg}
                  borderRadius="lg"
                  px={3}
                  py={2}
                  fontSize="sm"
                >
                  {c}
                </Box>
              )
            )}
          </VStack>
        )}

        {step.tips && (
          <Box bg={tipBg} borderRadius="lg" px={3} py={2} mt={4}>
            <Text fontSize="xs">
              <b>Tips:</b> {step.tips}
            </Text>
          </Box>
        )}
      </Box>

      <HStack justify="space-between">
        <Button
          size="sm"
          variant="outline"
          onClick={() => go(idx - 1)}
          isDisabled={idx === 0}
        >
          Sebelumnya
        </Button>
        {isLast ? (
          <Button size="sm" colorScheme="purple" onClick={() => onPractice?.()}>
            Mulai Latihan
          </Button>
        ) : (
          <Button size="sm" colorScheme="purple" onClick={() => go(idx + 1)}>
            Lanjut
          </Button>
        )}
      </HStack>
    </VStack>
  );
}
