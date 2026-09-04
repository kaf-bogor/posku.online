'use client';

import {
  Box,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
  Badge,
  Wrap,
  WrapItem,
  Button,
  Icon,
  Select,
  Divider,
  useDisclosure,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { FaListUl, FaFilter, FaTimes } from 'react-icons/fa';
import { FiSearch, FiMapPin } from 'react-icons/fi';

import DataChatBox from '~/app/components/DataChatBox';
import rawData from '~/lib/data/data_wali_santri.json';
import { useWaliSantri } from '~/lib/hooks/useWaliSantri';
import type {
  KategoriUtama,
  DataWaliSantriRecord,
} from '~/lib/types/data_wali_santri';
import { KATEGORI_META, KATEGORI_ORDER } from '~/lib/utils/waliSantriMeta';

import GroupedList from './components/GroupedList';
import MapView from './components/MapView';

const MAJOR_OPTIONS: { key: KategoriUtama | 'semua'; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  ...KATEGORI_ORDER.map((key) => ({ key, label: KATEGORI_META[key].label })),
];

// Filterable fields -> each gets a dropdown of distinct values from the data.
// `split: true` fields store several values separated by ',' or ';' (kelas,
// keahlian, bidang minat, dsb.), so we split them into single-value options.
const FILTER_DEFS: {
  key: keyof DataWaliSantriRecord;
  label: string;
  split: boolean;
}[] = [
  { key: 'subkategori', label: 'Sub-kategori Profesi', split: false },
  { key: 'kelas_anak', label: 'Kelas Anak', split: true },
  { key: 'pekerjaan_utama_ayah', label: 'Pekerjaan Ayah', split: false },
  { key: 'nama_instansi', label: 'Instansi', split: false },
  { key: 'bidang_pekerjaan_ayah', label: 'Bidang Kerja', split: true },
  { key: 'peran_di_pekerjaan', label: 'Peran', split: false },
  { key: 'keahlian_ayah', label: 'Keahlian Ayah', split: true },
  { key: 'hobi_minat', label: 'Hobi / Minat', split: true },
  { key: 'bidang_diminati_ayah', label: 'Minat Ayah (POSKU)', split: true },
  {
    key: 'ayah_bersedia_posku',
    label: 'Kesediaan Ayah (POSKU)',
    split: false,
  },
  {
    key: 'ayah_pernah_panitia_posku',
    label: 'Pernah Panitia (Ayah)',
    split: false,
  },
  { key: 'bidang_diminati_ibu', label: 'Minat Ibu (POSKU)', split: true },
  {
    key: 'ibu_bersedia_posku',
    label: 'Kesediaan Ibu (POSKU)',
    split: false,
  },
  {
    key: 'ibu_pernah_panitia_posku',
    label: 'Pernah Panitia (Ibu)',
    split: false,
  },
  {
    key: 'ayah_bersedia_tawaf',
    label: 'Kesediaan Ayah (TAWAF)',
    split: false,
  },
  { key: 'kontribusi_tawaf', label: 'Kontribusi TAWAF', split: true },
];

function tokenize(value: string): string[] {
  if (!value) return [];
  return value
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter((s) => s && !/^[-.0]+$/i.test(s));
}

type Option = { value: string; count: number };

function buildOptions(
  records: DataWaliSantriRecord[],
  def: (typeof FILTER_DEFS)[number]
): Option[] {
  const counter = new Map<string, { value: string; count: number }>();
  const seenPerRow = new Map<number, Set<string>>();
  records.forEach((r) => {
    const raw = String(r[def.key] ?? '');
    const trimmed = raw.trim();
    const isEmpty = !trimmed || /^[-.0]+$/i.test(trimmed);
    let values: string[];
    if (def.split) {
      values = tokenize(raw);
    } else if (isEmpty) {
      values = [];
    } else {
      values = [trimmed];
    }
    if (!seenPerRow.has(r.id)) seenPerRow.set(r.id, new Set());
    const rowSeen = seenPerRow.get(r.id)!;
    values.forEach((v) => {
      const lower = v.toLowerCase();
      if (rowSeen.has(lower)) return;
      rowSeen.add(lower);
      const cur = counter.get(lower);
      if (cur) {
        cur.count += 1;
      } else {
        counter.set(lower, { value: v, count: 1 });
      }
    });
  });
  const options = Array.from(counter.values());
  return options.sort((a, b) =>
    a.value.localeCompare(b.value, undefined, { sensitivity: 'base' })
  );
}

type Filters = Partial<Record<keyof DataWaliSantriRecord, string>>;

function matchesField(
  record: DataWaliSantriRecord,
  def: (typeof FILTER_DEFS)[number],
  selected: string
): boolean {
  const raw = String(record[def.key] ?? '');
  const values = def.split ? tokenize(raw) : [raw.trim()];
  return values.some((v) => v.toLowerCase() === selected.toLowerCase());
}

const DataWaliSantriPage = () => {
  const headingColor = useColorModeValue('gray.900', 'white');
  const subHeadingColor = useColorModeValue('gray.600', 'gray.400');
  const panelBg = useColorModeValue('gray.50', 'gray.800');

  const { isOpen, onToggle } = useDisclosure();

  const { data } = useWaliSantri(rawData as DataWaliSantriRecord[]);

  const [major, setMajor] = useState<KategoriUtama | 'semua'>('semua');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({});

  const optionCache = useMemo(() => {
    const cache: Partial<Record<keyof DataWaliSantriRecord, Option[]>> = {};
    FILTER_DEFS.forEach((def) => {
      cache[def.key] = buildOptions(data, def);
    });
    return cache;
  }, [data]);

  const activeFilterCount =
    (filters ? Object.keys(filters).length : 0) +
    (major !== 'semua' ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((r) => {
      if (major !== 'semua' && r.kategori !== major) return false;
      const hasActiveFilters = FILTER_DEFS.some(
        (def) => filters[def.key] !== undefined
      );
      const filterMatched = FILTER_DEFS.every((def) => {
        const selected = filters[def.key];
        if (!selected) return true;
        return matchesField(r, def, selected);
      });
      if (hasActiveFilters && !filterMatched) return false;
      if (q) {
        const haystack = [
          r.nama_ayah,
          r.nama_ibu,
          r.nama_anak,
          r.kelas_anak,
          r.pekerjaan_utama_ayah,
          r.nama_instansi,
          r.peran_di_pekerjaan,
          r.keahlian_ayah,
          r.alamat_rumah,
          r.subkategori,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [data, major, search, filters]);

  const stats = useMemo(
    () =>
      data.reduce<Record<string, number>>((acc, r) => {
        acc[r.kategori] = (acc[r.kategori] ?? 0) + 1;
        return acc;
      }, {}),
    [data]
  );

  const setFilter = (key: keyof DataWaliSantriRecord, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const resetAll = () => {
    setMajor('semua');
    setSearch('');
    setFilters({});
  };

  const onMapFilter = (m: KategoriUtama | 'semua') => setMajor(m);

  return (
    <Box>
      <VStack align="stretch" spacing={5}>
        <VStack align="start" spacing={1}>
          <Heading size="xl" fontWeight="extrabold" color={headingColor}>
            Data Wali Santri
          </Heading>
          <Text color={subHeadingColor} fontSize="md">
            Pendataan potensi wali santri POSKU Al-Fatih Bogor
          </Text>
        </VStack>

        {/* Ringkasan kategori */}
        <HStack spacing={2} wrap="wrap">
          <Badge colorScheme="blue" variant="subtle" px={3} py={1}>
            Total {data.length} keluarga
          </Badge>
          <Badge colorScheme="purple" variant="subtle" px={3} py={1}>
            Ditampilkan {filtered.length}
          </Badge>
          {KATEGORI_ORDER.filter((k) => k !== 'belum_terisi').map((k) => (
            <Badge
              key={k}
              colorScheme={KATEGORI_META[k].color}
              variant="subtle"
              px={3}
              py={1}
            >
              {KATEGORI_META[k].label}: {stats[k] ?? 0}
            </Badge>
          ))}
        </HStack>

        {/* Filter kategori (chip) */}
        <Wrap spacing={2}>
          {MAJOR_OPTIONS.map((opt) => (
            <WrapItem key={opt.key}>
              <Button
                size="sm"
                onClick={() => setMajor(opt.key)}
                colorScheme={
                  opt.key === 'semua'
                    ? 'gray'
                    : KATEGORI_META[opt.key as KategoriUtama].color
                }
                variant={major === opt.key ? 'solid' : 'outline'}
                borderRadius="full"
              >
                {opt.label}
              </Button>
            </WrapItem>
          ))}
        </Wrap>

        {/* Pencarian + toggle filter panel */}
        <HStack align="center" spacing={2} wrap="wrap">
          <InputGroup maxW={{ base: 'full', md: '420px' }} flex="1 1 auto">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Cari nama ayah/ibu, pekerjaan, keahlian, lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              borderRadius="xl"
            />
            {search && (
              <InputRightElement>
                <IconButton
                  aria-label="Hapus pencarian"
                  icon={<FaTimes />}
                  size="xs"
                  variant="ghost"
                  onClick={() => setSearch('')}
                />
              </InputRightElement>
            )}
          </InputGroup>
          <Button
            leftIcon={<FaFilter />}
            rightIcon={
              activeFilterCount > 0 ? (
                <Badge colorScheme="red" borderRadius="full">
                  {activeFilterCount}
                </Badge>
              ) : undefined
            }
            size="sm"
            variant={isOpen ? 'solid' : 'outline'}
            colorScheme="purple"
            onClick={onToggle}
          >
            Filter per Kolom
          </Button>
          {activeFilterCount > 0 && (
            <Button size="sm" variant="ghost" onClick={resetAll}>
              Reset
            </Button>
          )}
        </HStack>

        {/* Dropdown per field */}
        <Collapse in={isOpen} animateOpacity>
          <Box
            bg={panelBg}
            borderRadius="xl"
            p={4}
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Wrap spacing={3} align="start">
              {FILTER_DEFS.map((def) => {
                const options = optionCache[def.key] ?? [];
                const selected = filters[def.key] ?? '';
                return (
                  <WrapItem
                    key={def.key}
                    minW="150px"
                    maxW={{ base: '48%', md: '180px' }}
                    flex="1"
                  >
                    <VStack align="stretch" spacing={1} w="full">
                      <Text
                        fontSize="xs"
                        fontWeight="medium"
                        color={subHeadingColor}
                      >
                        {def.label}
                      </Text>
                      <Select
                        size="sm"
                        value={selected}
                        placeholder="Semua"
                        onChange={(e) => setFilter(def.key, e.target.value)}
                        isTruncated
                      >
                        {options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.value} ({o.count})
                          </option>
                        ))}
                      </Select>
                    </VStack>
                  </WrapItem>
                );
              })}
            </Wrap>
          </Box>
        </Collapse>

        <Divider />

        <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FaListUl} />
                <Text>Daftar Terkelompok</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiMapPin} />
                <Text>Peta Sebaran</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <GroupedList records={filtered} />
            </TabPanel>
            <TabPanel px={0}>
              <MapView records={filtered} onFilter={onMapFilter} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
      <Box h={4} />

      <DataChatBox
        title="Tanya Data Wali Santri"
        hint="Tanyakan potensi, kesediaan kontribusi, pekerjaan, dan kontak wali santri."
      />
    </Box>
  );
};

export default DataWaliSantriPage;
