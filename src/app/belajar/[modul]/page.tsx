'use client';

import { Button, Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import BelajarModule from '../components/BelajarModule';
import { getModul, isModulId } from '~/lib/belajar/modules';
import type { LevelId, MateriStep } from '~/lib/types/belajar';

type MateriMap = Record<LevelId, MateriStep[]>;

export default function BelajarModulPage() {
  const params = useParams<{ modul: string }>();
  const modulId = params?.modul ?? '';
  const meta = getModul(modulId);

  const [materi, setMateri] = useState<MateriMap | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    setMateri(null);
    try {
      const res = await fetch(
        `/api/belajar/materi?modul=${encodeURIComponent(modulId)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { materi?: MateriMap };
      if (!data.materi) throw new Error('kosong');
      setMateri(data.materi);
    } catch {
      setError(true);
    }
  }, [modulId]);

  useEffect(() => {
    if (isModulId(modulId)) load();
  }, [modulId, load]);

  if (!meta || !isModulId(modulId)) {
    return (
      <Center py={20}>
        <Text color="gray.500">Modul tidak ditemukan.</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Center py={20}>
        <VStack spacing={3}>
          <Text color="gray.500">Gagal memuat materi.</Text>
          <Button size="sm" colorScheme="purple" onClick={load}>
            Coba Lagi
          </Button>
        </VStack>
      </Center>
    );
  }

  if (!materi) {
    return (
      <Center py={20}>
        <VStack spacing={3}>
          <Spinner size="lg" color="purple.500" />
          <Text fontSize="sm" color="gray.500">
            Memuat materi...
          </Text>
        </VStack>
      </Center>
    );
  }

  return <BelajarModule modul={meta} materi={materi} />;
}
