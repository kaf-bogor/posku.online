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
  Select,
  Tabs,
  TabList,
  Tab,
  Switch,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  TableContainer,
} from '@chakra-ui/react';
import { onSnapshot, collection } from 'firebase/firestore';
import Link from 'next/link';
import { useContext, useState, useMemo, useEffect } from 'react';
import { FaMedal } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';
import { db } from '~/lib/firebase';
import { formatIDR } from '~/lib/utils/currency';

type Kelas = {
  name: string;
  santriCount: number;
  target?: number;
  collected?: number;
  participants?: { name: string; value: number; datetime: string }[];
};

export default function Page() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'peringkat' | 'name'>('peringkat');
  const [leaderboardMetric, setLeaderboardMetric] = useState<
    'total' | 'percent' | 'participants'
  >('total');
  const [anonymize, setAnonymize] = useState(false);

  const totalRaised = useMemo(
    () => kelasList.reduce((s, k) => s + (k.collected ?? 0), 0),
    [kelasList]
  );
  const totalTarget = useMemo(
    () => kelasList.reduce((s, k) => s + (k.target ?? 0), 0),
    [kelasList]
  );
  const { bgColor, textColor } = useContext(AppContext);

  // Seed Firestore and subscribe to changes
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'kelas'), async (snap) => {
      const data: Kelas[] = [];
      snap.docs.forEach((d) => {
        const kd = d.data() as Kelas;
        data.push(kd);
      });

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
    k.name?.toLowerCase().includes(query.toLowerCase())
  );

  const leaderboardSorted = useMemo(() => {
    const list = [...kelasList];
    switch (leaderboardMetric) {
      case 'percent':
        return list.sort(
          (a, b) =>
            (b.collected ?? 0) / (b.target ?? 1) -
            (a.collected ?? 0) / (a.target ?? 1)
        );
      case 'participants':
        return list.sort(
          (a, b) =>
            (b.participants?.length ?? 0) - (a.participants?.length ?? 0)
        );
      default:
        return list.sort((a, b) => (b.collected ?? 0) - (a.collected ?? 0));
    }
  }, [kelasList, leaderboardMetric]);

  const sortedKelas = useMemo(() => {
    const list = [...filtered];
    if (sortBy === 'peringkat') {
      return list.sort((a, b) => (b.collected ?? 0) - (a.collected ?? 0));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [filtered, sortBy]);

  return (
    <VStack align="stretch" spacing={4}>
      <HStack>
        <InputGroup bg={bgColor} color={textColor}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Cari kelas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <Select
          bg={bgColor}
          color={textColor}
          maxW="200px"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'peringkat' | 'name')}
        >
          <option value="peringkat">Peringkat</option>
          <option value="name">Nama</option>
        </Select>
      </HStack>

      {/* Leaderboard */}
      <Box
        borderWidth="1px"
        borderRadius="md"
        p={4}
        mb={4}
        bg={bgColor}
        color={textColor}
      >
        <Flex mb={2} align="center" justify="space-between">
          <Box>
            <Text fontSize="xl" fontWeight="bold">
              Peringkat
            </Text>
            <Text fontSize="sm">
              Total Raised {formatIDR(totalRaised)} / {formatIDR(totalTarget)}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Peringkat kelas berdasarkan berbagai metrik.
            </Text>
          </Box>
          <HStack>
            <Switch
              size="md"
              isChecked={anonymize}
              onChange={(e) => setAnonymize(e.target.checked)}
            />
            <Text fontSize="sm">Anonymize</Text>
          </HStack>
        </Flex>
        <Tabs
          variant="soft-rounded"
          colorScheme="blue"
          onChange={(idx) => {
            const metrics: ('total' | 'percent' | 'participants')[] = [
              'total',
              'percent',
              'participants',
            ];
            setLeaderboardMetric(metrics[idx]);
          }}
        >
          <TabList mb={4}>
            <Tab>Total Raised</Tab>
            <Tab>% Target</Tab>
            <Tab>Participation</Tab>
          </TabList>
        </Tabs>
        <TableContainer overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Peringkat</Th>
                <Th>Kelas</Th>
                <Th isNumeric>Terkumpul</Th>
                <Th isNumeric>% Target</Th>
                <Th isNumeric>Partisipan</Th>
              </Tr>
            </Thead>
            <Tbody>
              {leaderboardSorted.slice(0, 4).map((k, idx) => {
                const percent = ((k.collected ?? 0) / (k.target ?? 1)) * 100;
                const medalColors = [
                  'yellow.400',
                  'gray.400',
                  'orange.400',
                ] as const;
                const medalColor = medalColors[idx] ?? undefined;
                return (
                  <Tr key={k.name}>
                    <Td>
                      {idx < 3 ? (
                        <Icon as={FaMedal} color={medalColor} />
                      ) : (
                        `#${idx + 1}`
                      )}
                    </Td>
                    <Td>{anonymize ? `Class #${idx + 1}` : k.name}</Td>
                    <Td isNumeric>
                      Rp {(k.collected ?? 0).toLocaleString('id-ID')}
                    </Td>
                    <Td isNumeric>{percent.toFixed(1)}%</Td>
                    <Td isNumeric>{k.participants?.length ?? 0}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={12}>
        {sortedKelas.map((k) => {
          const { collected = 0, target = 0 } = k;
          const percent = (collected / target) * 100;
          return (
            <Link
              key={k.name}
              href={`/admin/kelas/${encodeURIComponent(k.name)}`}
              style={{ textDecoration: 'none' }}
            >
              <Box
                borderWidth="2px"
                borderColor="grey.400"
                rounded="md"
                p={4}
                w="full"
                _hover={{ shadow: 'md' }}
                color={textColor}
                bg={bgColor}
              >
                <Flex mb={2} align="center">
                  <Text fontSize="lg" fontWeight="bold">
                    {k.name}
                  </Text>
                  <Spacer />
                  <Badge colorScheme="blue">
                    Peringkat #{rankByName.get(k.name) ?? '-'}
                  </Badge>
                </Flex>

                <Text fontSize="sm">
                  Target: Rp {target.toLocaleString('id-ID')}
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
                  <Text fontSize="sm" minW="45px" textAlign="right">
                    {percent.toFixed(2)}%
                  </Text>
                </Flex>

                <HStack
                  spacing={4}
                  mb={4}
                  color="gray.600"
                  fontSize="sm"
                  alignItems="center"
                >
                  <Text fontSize="sm" textAlign="center">
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
