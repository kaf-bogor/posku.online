'use client';

import {
  Badge,
  Box,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { MODULES } from '~/lib/belajar/modules';
import { getProgress } from '~/lib/belajar/progress';

export default function BelajarPage() {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const subColor = useColorModeValue('gray.600', 'gray.400');
  const [best, setBest] = useState<Record<string, number>>({});

  useEffect(() => {
    const progress = getProgress();
    const map: Record<string, number> = {};
    Object.entries(progress).forEach(([key, val]) => {
      const modul = key.split(':')[0];
      if (val.bestScore != null) {
        map[modul] = Math.max(map[modul] ?? 0, val.bestScore);
      }
    });
    setBest(map);
  }, []);

  return (
    <VStack align="stretch" spacing={6}>
      <VStack align="start" spacing={1}>
        <Heading size="xl" fontWeight="extrabold">
          🎒 Belajar Yuk!
        </Heading>
        <Text color={subColor} fontSize="sm">
          Belajar bahasa Indonesia (SPOK) dan matematika dasar dengan materi
          interaktif dan latihan soal.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
        {MODULES.map((m) => (
          <Link key={m.id} href={`/belajar/${m.id}`} passHref legacyBehavior>
            <Box
              as="a"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="2xl"
              p={5}
              boxShadow="sm"
              transition="all 0.2s"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'md',
                borderColor: 'purple.300',
              }}
            >
              <VStack align="start" spacing={2}>
                <Text fontSize="3xl">{m.emoji}</Text>
                <Heading size="md">{m.label}</Heading>
                <Text fontSize="sm" color={subColor}>
                  {m.desc}
                </Text>
                {best[m.id] != null && (
                  <Badge
                    colorScheme="green"
                    variant="subtle"
                    borderRadius="full"
                  >
                    Skor terbaik: {best[m.id]}
                  </Badge>
                )}
              </VStack>
            </Box>
          </Link>
        ))}
      </SimpleGrid>
    </VStack>
  );
}
