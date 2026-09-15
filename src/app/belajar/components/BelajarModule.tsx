'use client';

import {
  Badge,
  Button,
  Heading,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import type { ModulMeta } from '~/lib/belajar/modules';
import { LEVELS } from '~/lib/belajar/modules';
import { getLevelProgress } from '~/lib/belajar/progress';
import type { LevelId, MateriStep } from '~/lib/types/belajar';

import LessonPlayer from './LessonPlayer';
import QuizPlayer from './QuizPlayer';

export default function BelajarModule({
  modul,
  materi,
}: {
  modul: ModulMeta;
  materi: Record<LevelId, MateriStep[]>;
}) {
  const [level, setLevel] = useState<LevelId>('mudah');
  const [tab, setTab] = useState(0);
  const [best, setBest] = useState<number | null>(null);

  const subColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    setBest(getLevelProgress(modul.id, level).bestScore ?? null);
  }, [modul.id, level]);

  const steps = materi[level] ?? [];

  return (
    <VStack align="stretch" spacing={5}>
      <VStack align="start" spacing={1}>
        <Heading size="xl" fontWeight="extrabold">
          {modul.emoji} {modul.label}
        </Heading>
        <Text color={subColor} fontSize="sm">
          {modul.desc}
        </Text>
      </VStack>

      <HStack spacing={2} wrap="wrap">
        {LEVELS.map((l) => (
          <Button
            key={l.id}
            size="sm"
            borderRadius="full"
            variant={level === l.id ? 'solid' : 'outline'}
            colorScheme="purple"
            onClick={() => {
              setLevel(l.id);
              setTab(0);
            }}
          >
            {l.label}
          </Button>
        ))}
        {best != null && (
          <Badge
            colorScheme="green"
            variant="subtle"
            borderRadius="full"
            px={3}
          >
            Skor terbaik: {best}
          </Badge>
        )}
      </HStack>

      <Tabs
        index={tab}
        onChange={setTab}
        variant="soft-rounded"
        colorScheme="purple"
      >
        <TabList>
          <Tab fontSize="sm">📖 Materi</Tab>
          <Tab fontSize="sm">🎯 Latihan</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <LessonPlayer
              key={`${modul.id}-${level}-materi`}
              steps={steps}
              modulId={modul.id}
              level={level}
              isMath={modul.isMath}
              onPractice={() => setTab(1)}
            />
          </TabPanel>
          <TabPanel px={0}>
            <QuizPlayer
              key={`${modul.id}-${level}-latihan`}
              modulId={modul.id}
              level={level}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
