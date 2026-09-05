'use client';

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
  Divider,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { FaCalendarAlt, FaListUl, FaSearch, FaTimes } from 'react-icons/fa';
import { FiRepeat } from 'react-icons/fi';

import KalenderMonthView from '../components/KalenderMonthView';
import PicWhatsAppLinks from '../components/PicWhatsAppLinks';
import rawData from '~/lib/data/kalender_posku.json';
import type {
  KalenderData,
  KalenderEvent,
  KalenderOngoing,
} from '~/lib/utils/kalender';
import {
  KATEGORI_COLOR,
  KATEGORI_LABEL,
  formatRentang,
  parseDateISO,
} from '~/lib/utils/kalender';

const data = rawData as KalenderData;

function groupByMonth(events: KalenderEvent[]) {
  const sorted = [...events].sort(
    (a, b) => parseDateISO(a.start).getTime() - parseDateISO(b.start).getTime()
  );
  const map: Record<string, KalenderEvent[]> = {};
  sorted.forEach((ev) => {
    const d = parseDateISO(ev.start);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map[key]) map[key] = [];
    map[key].push(ev);
  });
  return Object.entries(map).map(([key, list]) => {
    const [y, m] = key.split('-').map(Number);
    const label = new Date(y, m, 1).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
    return { label, events: list };
  });
}

const EventRow = ({ ev }: { ev: KalenderEvent }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const show = ev.desc || ev.pic || ev.committee;
  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={3.5}
      shadow="sm"
    >
      <HStack justify="space-between" align="flex-start" spacing={2}>
        <Box minW={0} flex={1}>
          <Text fontWeight="bold" fontSize="sm" noOfLines={2}>
            {ev.name}
          </Text>
          <Text fontSize="xs" color={muted} mt={0.5}>
            {formatRentang(ev)}
          </Text>
        </Box>
        <Badge
          colorScheme={KATEGORI_COLOR[ev.category]}
          variant="subtle"
          fontSize="10px"
          flexShrink={0}
        >
          {KATEGORI_LABEL[ev.category]}
        </Badge>
      </HStack>

      {show && (
        <>
          <Divider my={2} />
          <VStack align="stretch" spacing={0.5} fontSize="xs" color={muted}>
            {ev.pic && (
              <Text>
                <Text as="b" color="inherit">
                  PIC:
                </Text>{' '}
                <PicWhatsAppLinks value={ev.pic} />
              </Text>
            )}
            {ev.committee && (
              <Text>
                <Text as="b" color="inherit">
                  Penanggung jawab:
                </Text>{' '}
                {ev.committee}
              </Text>
            )}
            {ev.desc && (
              <Text noOfLines={3} mt={1}>
                {ev.desc}
              </Text>
            )}
          </VStack>
        </>
      )}
    </Box>
  );
};

const OngoingRow = ({ o }: { o: KalenderOngoing }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const muted = useColorModeValue('gray.500', 'gray.400');
  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={3.5}
      shadow="sm"
      borderLeft="4px solid"
      borderLeftColor="teal.400"
    >
      <HStack spacing={2} align="flex-start">
        <Box color="teal.500" mt={0.5}>
          <FiRepeat />
        </Box>
        <Box minW={0}>
          <Text fontWeight="bold" fontSize="sm">
            {o.name}
          </Text>
          <Text fontSize="xs" color={muted} mt={0.5}>
            {o.cadence}
          </Text>
          {o.desc && (
            <Text fontSize="xs" color={muted} mt={1}>
              {o.desc}
            </Text>
          )}
          {o.pic && (
            <Text fontSize="xs" color={muted} mt={1}>
              PIC: <PicWhatsAppLinks value={o.pic} />
            </Text>
          )}
        </Box>
      </HStack>
    </Box>
  );
};

const KalenderPoskuPage = () => {
  const headingColor = useColorModeValue('gray.900', 'white');
  const subColor = useColorModeValue('gray.600', 'gray.400');
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState('');

  const searchTerm = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!searchTerm) return data.events;
    return data.events.filter(
      (ev) =>
        ev.name.toLowerCase().includes(searchTerm) ||
        (ev.desc ?? '').toLowerCase().includes(searchTerm)
    );
  }, [searchTerm]);

  const ongoingFiltered = useMemo(() => {
    if (!searchTerm) return data.ongoing_programs;
    return data.ongoing_programs.filter(
      (o) =>
        o.name.toLowerCase().includes(searchTerm) ||
        (o.desc ?? '').toLowerCase().includes(searchTerm)
    );
  }, [searchTerm]);

  const firstMatch = useMemo(() => {
    if (!searchTerm || matches.length === 0) return null;
    return [...matches].sort(
      (a, b) =>
        parseDateISO(a.start).getTime() - parseDateISO(b.start).getTime()
    )[0];
  }, [matches, searchTerm]);

  const highlightKeys = useMemo(() => {
    if (!searchTerm) return undefined;
    return new Set(matches.map((ev) => `${ev.name}-${ev.start}`));
  }, [matches, searchTerm]);

  const grouped = useMemo(() => groupByMonth(matches), [matches]);

  return (
    <Box maxW="3xl" mx="auto" px={{ base: 4, sm: 6 }} py={{ base: 6, sm: 10 }}>
      <VStack align="stretch" spacing={6}>
        <VStack align="start" spacing={1}>
          <Heading size="xl" fontWeight="extrabold" color={headingColor}>
            Kalender POSKU
          </Heading>
          <Text color={subColor} fontSize="md">
            {data.subtitle} · {data.range}
          </Text>
        </VStack>

        <InputGroup size="md">
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Cari kegiatan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            borderRadius="xl"
          />
          {query && (
            <InputRightElement>
              <IconButton
                aria-label="Hapus pencarian"
                icon={<FaTimes />}
                size="sm"
                variant="ghost"
                onClick={() => setQuery('')}
              />
            </InputRightElement>
          )}
        </InputGroup>

        <Tabs
          index={tab}
          onChange={setTab}
          variant="soft-rounded"
          colorScheme="blue"
        >
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FaCalendarAlt} />
                <Text>Kalender</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FaListUl} />
                <Text>Daftar Kegiatan</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <KalenderMonthView
                events={data.events}
                holidays={data.holidays}
                targetDate={firstMatch?.start}
                highlightKeys={highlightKeys}
              />
            </TabPanel>

            <TabPanel px={0}>
              <VStack align="stretch" spacing={5}>
                {ongoingFiltered.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={2} color={headingColor}>
                      Program Rutin &amp; Berjalan
                    </Heading>
                    <VStack spacing={2} align="stretch">
                      {ongoingFiltered.map((o) => (
                        <OngoingRow key={o.name} o={o} />
                      ))}
                    </VStack>
                  </Box>
                )}

                {grouped.map((g) => (
                  <Box key={g.label}>
                    <Heading size="sm" mb={2} color={headingColor}>
                      {g.label}
                    </Heading>
                    <VStack spacing={2} align="stretch">
                      {g.events.map((ev) => (
                        <EventRow key={`${ev.name}-${ev.start}`} ev={ev} />
                      ))}
                    </VStack>
                  </Box>
                ))}

                {searchTerm &&
                  matches.length === 0 &&
                  ongoingFiltered.length === 0 && (
                    <Box textAlign="center" py={8}>
                      <Text color={subColor}>
                        Tidak ada kegiatan yang cocok.
                      </Text>
                    </Box>
                  )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default KalenderPoskuPage;
