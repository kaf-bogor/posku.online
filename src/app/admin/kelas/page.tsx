'use client';

import { SearchIcon } from '@chakra-ui/icons';
import {
  Box,
  Text,
  Badge,
  Progress,
  VStack,
  HStack,
  Flex,
  Spacer,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';

import { db } from '~/lib/firebase';

type Kelas = {
  name: string;
  santriCount: number;
  target?: number;
  collected?: number;
  participants?: { name: string; value: number; datetime: string }[];
};

const DEFAULT_TARGET = 5000000;

const DEFAULT_KELAS: Kelas[] = [
  { name: 'Kuttab Awal 1A', santriCount: 11 },
  { name: 'Kuttab Awal 1B', santriCount: 12 },
  { name: 'Kuttab Awal 2A', santriCount: 11 },
  { name: 'Kuttab Awal 2B', santriCount: 11 },
  { name: 'Kuttab Awal 2C', santriCount: 11 },
  { name: 'Kuttab Awal 2D', santriCount: 10 },
  { name: 'Kuttab Awal 3A', santriCount: 8 },
  { name: 'Kuttab Awal 3B', santriCount: 7 },
  { name: 'Kuttab Awal 3C', santriCount: 11 },
  { name: 'Kuttab Awal 3D', santriCount: 10 },
  { name: 'Qonuni 1A', santriCount: 16 },
  { name: 'Qonuni 1B', santriCount: 16 },
  { name: 'Qonuni 1C', santriCount: 11 },
  { name: 'Qonuni 2A', santriCount: 14 },
  { name: 'Qonuni 2B', santriCount: 17 },
  { name: 'Qonuni 3A', santriCount: 20 },
  { name: 'Qonuni 3B', santriCount: 11 },
  { name: 'Qonuni 4A', santriCount: 24 },
  { name: 'Qonuni 4B', santriCount: 17 },
];

export default function Page() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [query, setQuery] = useState('');

  // Seed Firestore and subscribe to changes
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'kelas'), async (snap) => {
      const existingNames = new Set<string>();
      const data: Kelas[] = [];
      snap.docs.forEach((d) => {
        const kd = d.data() as Kelas;
        existingNames.add(kd.name);
        data.push(kd);
      });

      // seed missing
      const missing = DEFAULT_KELAS.filter((k) => !existingNames.has(k.name));

      if (missing.length) {
        await Promise.all(
          missing.map((kelas) =>
            setDoc(doc(db, 'kelas', kelas.name), {
              name: kelas.name,
              santriCount: kelas.santriCount,
              target: 0,
              participants: [],
            } as Kelas)
          )
        );

        data.push(
          ...missing.map((kelas) => ({ ...kelas, target: 0, participants: [] }))
        );
      }
      setKelasList(data);
    });
    return () => unsub();
  }, []);

  // Rank calculation based on total collected (descending)
  const rankByName = useMemo(() => {
    const sorted = [...kelasList].sort(
      (a, b) => (b.collected ?? 0) - (a.collected ?? 0)
    );
    const map = new Map<string, number>();
    sorted.forEach((k, idx) => {
      map.set(k.name, idx + 1);
    });
    return map;
  }, [kelasList]);

  const filtered = kelasList.filter((k) =>
    k.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <VStack align="stretch" spacing={4}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Cari kelas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </InputGroup>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {filtered.map((k) => {
          const { collected = 0 } = k;
          const percent = (collected / DEFAULT_TARGET) * 100;
          return (
            <Link
              key={k.name}
              href={`/admin/kelas/${encodeURIComponent(k.name)}`}
              style={{ textDecoration: 'none' }}
            >
              <Box
                borderWidth="2px"
                borderColor="yellow.400"
                rounded="md"
                p={4}
                w="full"
                _hover={{ shadow: 'md' }}
                bg="white"
              >
                <Flex mb={2} align="center">
                  <Text fontSize="lg" fontWeight="bold" color="blue.700">
                    {k.name}
                  </Text>
                  <Spacer />
                  <Badge colorScheme="blue">
                    Peringkat #{rankByName.get(k.name) ?? '-'}
                  </Badge>
                </Flex>

                <Text fontSize="sm" color="gray.600">
                  Target: Rp {DEFAULT_TARGET.toLocaleString('id-ID')}
                </Text>

                <Text fontSize="2xl" fontWeight="bold" mt={2}>
                  Rp {collected.toLocaleString('id-ID')}
                </Text>
                <Flex align="center" mb={2}>
                  <Progress
                    value={percent}
                    size="sm"
                    flex="1"
                    borderRadius="sm"
                    colorScheme="blue"
                    mr={2}
                  />
                  <Text
                    fontSize="sm"
                    color="blue.600"
                    minW="45px"
                    textAlign="right"
                  >
                    {percent}%
                  </Text>
                </Flex>

                <HStack
                  spacing={4}
                  mb={4}
                  color="gray.600"
                  fontSize="sm"
                  alignItems="center"
                >
                  <Text fontSize="sm" color="gray.700" textAlign="center">
                    Lihat Detail
                  </Text>
                </HStack>
              </Box>
            </Link>
          );
        })}
      </SimpleGrid>
    </VStack>
  );
}
