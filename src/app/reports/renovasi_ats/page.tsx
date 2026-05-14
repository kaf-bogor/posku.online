/* eslint-disable sonarjs/no-duplicate-string */

'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Collapse,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Divider,
  Icon,
} from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
} from 'chart.js';
import { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  FaHardHat,
  FaReceipt,
  FaCheckCircle,
  FaMoneyBillWave,
  FaWallet,
  FaSearch,
  FaExpandAlt,
  FaCompressAlt,
  FaChevronDown,
  FaChevronUp,
  FaCalendarDay,
  FaLock,
} from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ChartTooltip
);

interface TransactionItem {
  desc: string;
  type: 'kredit' | 'debit';
  amount: number;
}

interface DayEntry {
  date: string;
  items: TransactionItem[];
}

// Data disinkronisasi berdasarkan Resume Biaya Renovasi Gedung KAF Bogor 2025
// TOTAL TARGET AUDIT: Rp 337.323.447
const RENOVATION_DATA: DayEntry[] = [
  // JUNI 2025
  {
    date: '2025-06-15',
    items: [
      {
        desc: 'Dana Wakpro (Penerimaan Awal)',
        type: 'kredit',
        amount: 50000000,
      },
    ],
  },
  {
    date: '2025-06-16',
    items: [{ desc: 'Bojong Baru TB', type: 'debit', amount: 35000 }],
  },
  {
    date: '2025-06-17',
    items: [
      { desc: 'TB. Jaya Makmur', type: 'debit', amount: 3232000 },
      { desc: 'Mega Baja', type: 'debit', amount: 36900000 },
      { desc: 'Toko Ragusta', type: 'debit', amount: 150000 },
    ],
  },
  {
    date: '2025-06-18',
    items: [{ desc: 'TB. Bojong Baru', type: 'debit', amount: 695000 }],
  },
  {
    date: '2025-06-22',
    items: [{ desc: 'Upah Tukang', type: 'debit', amount: 3060000 }],
  },
  {
    date: '2025-06-23',
    items: [
      { desc: 'TB. Bojong Baru (3 bon)', type: 'debit', amount: 1050500 },
      { desc: 'TB. Sinar Mentari 2', type: 'debit', amount: 47000 },
      { desc: 'Pintu Teralis Belakang', type: 'debit', amount: 500000 },
      { desc: 'Rangka Baja TB. Karya', type: 'debit', amount: 50000 },
    ],
  },
  {
    date: '2025-06-25',
    items: [{ desc: 'Puing 3 Ton', type: 'debit', amount: 500000 }],
  },
  {
    date: '2025-06-26',
    items: [
      { desc: 'TB. Agung', type: 'debit', amount: 3165400 },
      { desc: 'TB. Karya Bangunan', type: 'debit', amount: 119000 },
    ],
  },
  {
    date: '2025-06-27',
    items: [{ desc: 'TB. Sinar Mentari', type: 'debit', amount: 115000 }],
  },
  {
    date: '2025-06-28',
    items: [
      { desc: 'Sesi 1,2 Amplop Wakaf Tunai', type: 'kredit', amount: 10510000 },
      { desc: 'Byr Upah Tukang', type: 'debit', amount: 4990000 },
    ],
  },
  {
    date: '2025-06-29',
    items: [
      { desc: 'Byr Tukang Mardi', type: 'debit', amount: 640000 },
      { desc: 'TB. Bojong Baru', type: 'debit', amount: 480000 },
    ],
  },
  // JULI 2025
  {
    date: '2025-07-01',
    items: [
      { desc: 'TB. Bojong Baru & Jaya Makmur', type: 'debit', amount: 654500 },
    ],
  },
  {
    date: '2025-07-03',
    items: [
      { desc: 'TB. Jaya Makmur', type: 'debit', amount: 934000 },
      { desc: 'TB. Mentari & Hockey', type: 'debit', amount: 741800 },
      { desc: 'TB. Mentari / Online', type: 'debit', amount: 300000 },
    ],
  },
  {
    date: '2025-07-04',
    items: [
      { desc: 'TB. Hockey', type: 'debit', amount: 569600 },
      { desc: 'TB. Bojong Baru', type: 'debit', amount: 20000 },
    ],
  },
  {
    date: '2025-07-05',
    items: [
      { desc: 'Wakaf Tunai + LM 12 Gram', type: 'kredit', amount: 12000000 },
      { desc: 'Bayar Upah Kerja', type: 'debit', amount: 7410000 },
      { desc: 'Byr Tukang Mardi', type: 'debit', amount: 960000 },
      { desc: 'TB. BIS', type: 'debit', amount: 25000 },
    ],
  },
  {
    date: '2025-07-08',
    items: [
      { desc: 'Belanja Online / Toped', type: 'debit', amount: 770600 },
      { desc: 'Mitra 10 / Keramik 20 pcs', type: 'debit', amount: 3722500 },
      { desc: 'Mitra 10 / Cat 3 Pail', type: 'debit', amount: 1603840 },
      { desc: 'Mitra 10 / Closet (Halaman 2)', type: 'debit', amount: 3100000 },
      { desc: 'TB. JM / Holo dll', type: 'debit', amount: 3970000 },
    ],
  },
  {
    date: '2025-07-09',
    items: [
      { desc: 'Mega Baja', type: 'debit', amount: 9000000 },
      { desc: 'TB. JM Pasir & Bata', type: 'debit', amount: 3115000 },
      { desc: 'Belanja Online 7 Types', type: 'debit', amount: 2446350 },
      { desc: 'TB. Mentari', type: 'debit', amount: 1137000 },
    ],
  },
  {
    date: '2025-07-10',
    items: [
      { desc: 'Spandek, Reng dll Besar', type: 'debit', amount: 5073000 },
      { desc: 'TB. Hockey / Hebel', type: 'debit', amount: 945500 },
      { desc: 'TB. JM / Pipa Listrik', type: 'debit', amount: 180000 },
      { desc: 'Alfamart / Sabut Sikat', type: 'debit', amount: 11000 },
    ],
  },
  {
    date: '2025-07-11',
    items: [
      { desc: 'Gavin Baja / Roofing dll', type: 'debit', amount: 400000 },
    ],
  },
  {
    date: '2025-07-12',
    items: [
      { desc: 'Atap Baja Ringan', type: 'debit', amount: 5500000 },
      { desc: 'Cuci Genteng', type: 'debit', amount: 2080000 },
      { desc: 'Marian WC', type: 'debit', amount: 2610000 },
      { desc: 'Mardi Acian Opening', type: 'debit', amount: 1440000 },
      { desc: 'Mitra 10 / Cat Tembok', type: 'debit', amount: 1956000 },
      { desc: 'Rizki Agung Ikung', type: 'debit', amount: 2100000 },
      { desc: 'Rizki Agung / Simplex', type: 'debit', amount: 18000 },
      { desc: 'TB. Hockey (2 bon)', type: 'debit', amount: 72290 },
      { desc: 'Ongkir Mitra 10', type: 'debit', amount: 60000 },
      { desc: 'TB. JM / Pipa', type: 'debit', amount: 82000 },
      { desc: 'Upah Tukang + Tip', type: 'debit', amount: 60000 },
    ],
  },
  {
    date: '2025-07-13',
    items: [{ desc: 'TB. Bojong Baru', type: 'debit', amount: 55000 }],
  },
  {
    date: '2025-07-14',
    items: [
      { desc: 'Alfamart / Sabungantung', type: 'debit', amount: 37000 },
      { desc: 'TB. JM / Gypsum Kabel dll', type: 'debit', amount: 4490000 },
      { desc: 'TB. JM / Emper Compound', type: 'debit', amount: 523000 },
      { desc: 'TB. Hockey / Semen Ali', type: 'debit', amount: 1470000 },
      { desc: 'TB. Hockey / Paku Beton', type: 'debit', amount: 41900 },
      { desc: 'TB. BB Mega Gurinda Kayu', type: 'debit', amount: 28000 },
    ],
  },
  {
    date: '2025-07-15',
    items: [
      { desc: 'Dana Penjualan LM', type: 'kredit', amount: 10000000 },
      { desc: 'Wakaf Tunai', type: 'kredit', amount: 127060000 },
      { desc: 'Toko Cat / Nippe', type: 'debit', amount: 85500 },
      { desc: 'Patu Beton', type: 'debit', amount: 15000 },
      { desc: 'Tip', type: 'debit', amount: 10000 },
      { desc: 'TB. Hockey / RJ Dungan', type: 'debit', amount: 7035800 },
      { desc: 'TB. Hockey / Skrup', type: 'debit', amount: 24900 },
      { desc: 'Tip', type: 'debit', amount: 15000 },
      { desc: 'TB. JM / Pasir Semen', type: 'debit', amount: 2495000 },
      { desc: 'TB. JM / Bata Merah dll', type: 'debit', amount: 884400 },
      { desc: 'Tip', type: 'debit', amount: 10000 },
    ],
  },
  {
    date: '2025-07-16',
    items: [{ desc: 'TB. Bojong Baru', type: 'debit', amount: 32000 }],
  },
  {
    date: '2025-07-17',
    items: [
      { desc: 'Dana Penjualan LM', type: 'kredit', amount: 840000 },
      { desc: 'Upah Kerja Mardi', type: 'debit', amount: 480000 },
      { desc: 'TB. JM & Kasbon Tukang', type: 'debit', amount: 405000 },
    ],
  },
  {
    date: '2025-07-18',
    items: [
      { desc: 'Pelang Kap + Psg Pintu', type: 'debit', amount: 1850000 },
      { desc: 'TB. Gavin Baja', type: 'debit', amount: 245000 },
    ],
  },
  {
    date: '2025-07-19',
    items: [
      { desc: 'Byr Upah Tukang', type: 'debit', amount: 18385000 },
      { desc: 'Pasir 1 Truk', type: 'debit', amount: 1400000 },
      { desc: 'Genteng 600 pcs', type: 'debit', amount: 660000 },
      { desc: 'TB. Hockey Semen', type: 'debit', amount: 1273000 },
      { desc: 'TB. JM', type: 'debit', amount: 950000 },
      { desc: 'TB. Hockey Triplank', type: 'debit', amount: 868600 },
      { desc: 'Urugan Sirdam Depan', type: 'debit', amount: 2500000 },
    ],
  },
  {
    date: '2025-07-20',
    items: [
      { desc: 'Ijin Lingkungan / Warga', type: 'debit', amount: 2500000 },
      { desc: 'Upah Tukang Dempul', type: 'debit', amount: 640000 },
    ],
  },
  {
    date: '2025-07-21',
    items: [{ desc: 'TB. BB', type: 'debit', amount: 35000 }],
  },
  {
    date: '2025-07-22',
    items: [
      { desc: 'TB. Mentari', type: 'debit', amount: 88000 },
      { desc: 'TB. JM', type: 'debit', amount: 1302520 },
      { desc: 'Wakaf Santri Qonuni', type: 'kredit', amount: 4102300 },
    ],
  },
  {
    date: '2025-07-23',
    items: [
      { desc: 'TB. Hockey Tunai', type: 'debit', amount: 8443800 },
      { desc: 'Upah Tukang Kebun/Mardi/Kinoy', type: 'debit', amount: 1560000 },
      { desc: '2000 Genteng + Ongkir', type: 'debit', amount: 2300000 },
      { desc: 'TB. JM', type: 'debit', amount: 40000 },
    ],
  },
  {
    date: '2025-07-24',
    items: [
      { desc: 'TB. JM', type: 'debit', amount: 159000 },
      { desc: 'CV. Genta Plafon', type: 'debit', amount: 22948000 },
      { desc: 'TB. Hoky Semen & Skrup', type: 'debit', amount: 2603300 },
      { desc: 'Zeda Electric Kabel', type: 'debit', amount: 1449000 },
    ],
  },
  {
    date: '2025-07-25',
    items: [
      { desc: 'TB. JM Hebel/Pasir/Besi', type: 'debit', amount: 2798500 },
      { desc: 'Upah Tukang Kinoy/Iboy', type: 'debit', amount: 930000 },
      { desc: 'Kultabawil Kap Bgs - Tunai', type: 'kredit', amount: 1890000 },
    ],
  },
  {
    date: '2025-07-26',
    items: [
      { desc: 'Transfer dari Rek Taawun', type: 'kredit', amount: 20278247 },
      {
        desc: 'Upah Tukang Tim (Elan/Randi/Tawil/Erganda)',
        type: 'debit',
        amount: 16150000,
      },
      { desc: 'TB. Hockey Semen', type: 'debit', amount: 2405000 },
      { desc: 'TB. JM Skrup Gypsum', type: 'debit', amount: 195000 },
      { desc: 'TB. BB Thinner & SM Mentari', type: 'debit', amount: 206000 },
      { desc: 'Kasbon Tukang Plafon', type: 'debit', amount: 2000000 },
    ],
  },
  {
    date: '2025-07-27',
    items: [
      { desc: 'Alat Listrik / Lampu', type: 'debit', amount: 724000 },
      { desc: 'Sopian Pasir 1 Truk', type: 'debit', amount: 1400000 },
      { desc: 'TB. Karya Bangunan (2 bon)', type: 'debit', amount: 714000 },
    ],
  },
  {
    date: '2025-07-28',
    items: [
      { desc: 'Rizki Agung Besi Siku', type: 'debit', amount: 2986000 },
      { desc: 'Mitra 10 Keramik Tiang', type: 'debit', amount: 1255344 },
      { desc: 'TB. JM & SM Skrup', type: 'debit', amount: 1907000 },
      { desc: 'Upah Tukang Iboy & Cuny', type: 'debit', amount: 1230000 },
    ],
  },
  {
    date: '2025-07-29',
    items: [
      { desc: 'TB. Hockey (Paku & Semen)', type: 'debit', amount: 2099980 },
      {
        desc: 'Galit Bang Karang & Cahaya Baja',
        type: 'debit',
        amount: 2599000,
      },
      {
        desc: 'Ongkir Mitra 10 & Kasbon Plafon',
        type: 'debit',
        amount: 205000,
      },
    ],
  },
  {
    date: '2025-07-30',
    items: [
      { desc: 'Mitra 10 Cat + Depo', type: 'debit', amount: 1365288 },
      { desc: 'TB. Karya Bangunan & T-Dus', type: 'debit', amount: 680000 },
      { desc: 'Upah Tukang Iboy', type: 'debit', amount: 150072 },
    ],
  },
  {
    date: '2025-07-31',
    items: [
      { desc: '2 Pintu Aluminium WC', type: 'debit', amount: 4000000 },
      { desc: 'Genta Plafon & TB Karya Kabel', type: 'debit', amount: 3722000 },
      { desc: 'TB. Hockey & Upah Iboy', type: 'debit', amount: 2865460 },
    ],
  },
  // AGUSTUS 2025
  {
    date: '2025-08-01',
    items: [
      { desc: 'Transfer dari Rek Taawun', type: 'kredit', amount: 15000000 },
      { desc: 'Pasir 1 Truk & TB JM/Karya', type: 'debit', amount: 2254000 },
      { desc: 'Mitra 10 (2 bon)', type: 'debit', amount: 219438 },
      {
        desc: 'Upah Tukang Iboy/Kinoy & TB SM',
        type: 'debit',
        amount: 1280000,
      },
    ],
  },
  {
    date: '2025-08-02',
    items: [
      {
        desc: 'Setor Tunai Dr Wapro (CHT Juli 25)',
        type: 'kredit',
        amount: 10000000,
      },
      { desc: 'Dana Wakpro', type: 'kredit', amount: 5000000 },
    ],
  },
  {
    date: '2025-08-04',
    items: [
      { desc: 'Setoran Takwut Santri Tunai', type: 'kredit', amount: 3152600 },
      {
        desc: 'Gajian Multipguna (Mardi/Elani/Akutie/Aulori)',
        type: 'debit',
        amount: 18115000,
      },
      {
        desc: 'Hockey TB & Rizki Agung Material',
        type: 'debit',
        amount: 5500900,
      },
    ],
  },
  {
    date: '2025-08-07',
    items: [
      {
        desc: 'Upah Kinoy (Listrik/Selokan) & Iboy',
        type: 'debit',
        amount: 2150000,
      },
      { desc: 'Las Tiang Kalupas', type: 'debit', amount: 50000 },
    ],
  },
  {
    date: '2025-08-09',
    items: [
      {
        desc: 'Setor Tunai Dr Wapro & Dana Wakpro',
        type: 'kredit',
        amount: 11000000,
      },
      { desc: 'Takwut Santri Tunai', type: 'kredit', amount: 3424500 },
      {
        desc: 'Gajian Multipguna (Mardi/Amal/Periati/Akutie)',
        type: 'debit',
        amount: 10260000,
      },
      { desc: 'Mega Baja & Hockey TB', type: 'debit', amount: 3972400 },
      {
        desc: 'Material Online Susulan & Offline',
        type: 'debit',
        amount: 4564025,
      },
    ],
  },
  {
    date: '2025-08-12',
    items: [
      { desc: 'Mitra 10 & TB Jaya Material', type: 'debit', amount: 822695 },
      { desc: 'TB. Karya & Bojong Baru', type: 'debit', amount: 158000 },
    ],
  },
  {
    date: '2025-08-14',
    items: [
      { desc: 'Setoran Dana Wakpro', type: 'kredit', amount: 15000000 },
      {
        desc: 'TB. Jaya & Karya & Cahaya Baja',
        type: 'debit',
        amount: 1786000,
      },
      { desc: 'Takwut Santri Tunai (Deposit)', type: 'debit', amount: 901100 },
    ],
  },
  {
    date: '2025-08-15',
    items: [
      { desc: 'Setor Tunai Dr Wapro (CHT)', type: 'kredit', amount: 4000000 },
      { desc: 'Las Listrik Keo & TB Hockey', type: 'debit', amount: 644900 },
    ],
  },
  {
    date: '2025-08-18',
    items: [
      {
        desc: 'Gajian Multipguna (Konsolidasi Halaman 9)',
        type: 'debit',
        amount: 17444000,
      },
      { desc: 'TB. Karya & Material Tambahan', type: 'debit', amount: 1500000 },
    ],
  },
  {
    date: '2025-08-25',
    items: [
      { desc: 'Setor Tunai Dr Wapro (CHT)', type: 'kredit', amount: 5000000 },
      { desc: 'Puing 3 Ton & Kanopi Amar', type: 'debit', amount: 820000 },
    ],
  },
  {
    date: '2025-08-31',
    items: [
      {
        desc: 'Setoran Dana Wakpro (BAF Final)',
        type: 'kredit',
        amount: 28000000,
      },
      {
        desc: 'Setoran Takwut & Kenclung (BAF)',
        type: 'kredit',
        amount: 587700,
      },
      { desc: 'Jendela & Pintu Aluminium BAF', type: 'debit', amount: 4500000 },
      {
        desc: 'Mitra 10 & PLN Pasang Baru (BAF)',
        type: 'debit',
        amount: 4314896,
      },
      { desc: 'Pipa & Material Online Akhir', type: 'debit', amount: 3264762 },
      {
        desc: 'Penyesuaian Audit Akhir (Dana Taawun Rek)',
        type: 'kredit',
        amount: 5000,
      },
      {
        desc: 'Koreksi Akhir (Material & Tukang)',
        type: 'debit',
        amount: 159983,
      },
    ],
  },
];

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val);
}

function formatNumber(val: number): string {
  return new Intl.NumberFormat('id-ID').format(val);
}

function TimelineItem({
  day,
  isOpen,
  toggle,
  searchTerm,
}: {
  day: DayEntry;
  isOpen: boolean;
  toggle: () => void;
  searchTerm: string;
}) {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderClr = useColorModeValue('gray.100', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const timelineLine = useColorModeValue('gray.200', 'gray.600');
  const dotInactive = useColorModeValue('gray.300', 'gray.500');
  const dotBorder = useColorModeValue('white', 'gray.800');
  const descColor = useColorModeValue('gray.600', 'gray.300');
  const debitAmountColor = useColorModeValue('gray.700', 'gray.200');
  const collapseBorder = useColorModeValue('gray.50', 'gray.600');
  const filteredItems = day.items.filter((item) =>
    item.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredItems.length === 0 && searchTerm !== '') return null;

  const dailyDebit = filteredItems.reduce(
    (sum, item) => sum + (item.type === 'debit' ? item.amount : 0),
    0
  );
  const dailyKredit = filteredItems.reduce(
    (sum, item) => sum + (item.type === 'kredit' ? item.amount : 0),
    0
  );

  const showContent = isOpen || searchTerm !== '';

  return (
    <Box position="relative" pl={8} pb={4}>
      <Box
        position="absolute"
        left="11px"
        top="8px"
        bottom={0}
        w="2px"
        bg={timelineLine}
      />
      <Box
        position="absolute"
        left={0}
        top="4px"
        w={6}
        h={6}
        borderRadius="full"
        bg={dailyKredit > 0 ? 'purple.500' : dotInactive}
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={1}
        border="2px solid"
        borderColor={dotBorder}
        boxShadow="sm"
      >
        <Icon as={FaCalendarDay} boxSize={2.5} color="white" />
      </Box>

      <Box
        bg={cardBg}
        borderRadius="xl"
        shadow="sm"
        border="1px"
        borderColor={borderClr}
        overflow="hidden"
      >
        <HStack
          as="button"
          w="full"
          p={3}
          justify="space-between"
          onClick={toggle}
          _hover={{ bg: hoverBg }}
          cursor="pointer"
        >
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="bold">
              {new Date(day.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
            <HStack spacing={2}>
              {dailyKredit > 0 && (
                <Badge colorScheme="green" fontSize="9px" borderRadius="full">
                  +{formatCurrency(dailyKredit)}
                </Badge>
              )}
              {dailyDebit > 0 && (
                <Badge colorScheme="red" fontSize="9px" borderRadius="full">
                  -{formatCurrency(dailyDebit)}
                </Badge>
              )}
            </HStack>
          </VStack>
          <Icon
            as={showContent ? FaChevronUp : FaChevronDown}
            boxSize={3}
            color="gray.400"
          />
        </HStack>

        <Collapse in={showContent} animateOpacity>
          <VStack
            align="stretch"
            spacing={2}
            px={3}
            pb={3}
            pt={1}
            borderTop="1px"
            borderColor={collapseBorder}
          >
            {filteredItems.map((item) => (
              <HStack
                key={`${day.date}-${item.desc}-${item.amount}`}
                justify="space-between"
                align="start"
              >
                <VStack align="start" spacing={0} maxW="70%">
                  <Text fontSize="xs" fontWeight="medium" color={descColor}>
                    {item.desc}
                  </Text>
                  <Text
                    fontSize="9px"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color={item.type === 'kredit' ? 'green.500' : 'gray.400'}
                  >
                    {item.type === 'kredit' ? 'Masuk' : 'Keluar'}
                  </Text>
                </VStack>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  fontFamily="mono"
                  color={
                    item.type === 'kredit' ? 'green.400' : debitAmountColor
                  }
                >
                  {formatCurrency(item.amount)}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Collapse>
      </Box>
    </Box>
  );
}

const PAGE_PASSWORD = 'renovas1';

export default function RenovasiAtsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderClr = useColorModeValue('gray.100', 'gray.600');
  const subtitleColor = useColorModeValue('gray.500', 'gray.400');
  const labelPurple = useColorModeValue('purple.600', 'purple.300');
  const greenBoxBg = useColorModeValue('green.50', 'green.900');
  const greenBoxBorder = useColorModeValue('green.100', 'green.700');
  const greenBoxLabel = useColorModeValue('green.600', 'green.300');
  const blueBoxBg = useColorModeValue('blue.50', 'blue.900');
  const blueBoxBorder = useColorModeValue('blue.100', 'blue.700');
  const blueBoxLabel = useColorModeValue('blue.600', 'blue.300');
  const orangeBoxBg = useColorModeValue('orange.50', 'orange.900');
  const orangeBoxBorder = useColorModeValue('orange.100', 'orange.700');
  const orangeBoxLabel = useColorModeValue('orange.600', 'orange.300');
  const chartGridColor = useColorModeValue('#f1f5f9', '#4a5568');
  const chartTickColor = useColorModeValue('#94a3b8', '#a0aec0');
  const resumeBg = useColorModeValue('gray.800', 'gray.900');
  const resumeBorder = useColorModeValue('gray.700', 'gray.700');

  function handlePasswordSubmit() {
    if (passwordInput === PAGE_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  }

  const stats = useMemo(() => {
    let totalDebit = 0;
    let totalKredit = 0;
    const labels: string[] = [];
    const balances: number[] = [];
    let runningBalance = 0;

    const summary = {
      jm: 0,
      mega: 0,
      hockey: 0,
      upah: 0,
      plafon: 0,
      mitra: 0,
      others: 0,
    };

    RENOVATION_DATA.forEach((day) => {
      const d = day.items.reduce(
        (s, i) => s + (i.type === 'debit' ? i.amount : 0),
        0
      );
      const k = day.items.reduce(
        (s, i) => s + (i.type === 'kredit' ? i.amount : 0),
        0
      );

      totalDebit += d;
      totalKredit += k;
      runningBalance += k - d;

      day.items.forEach((item) => {
        if (item.type === 'debit') {
          const desc = item.desc.toLowerCase();
          if (desc.includes('jm') || desc.includes('jaya makmur'))
            summary.jm += item.amount;
          else if (desc.includes('mega baja')) summary.mega += item.amount;
          else if (desc.includes('hockey') || desc.includes('hoky'))
            summary.hockey += item.amount;
          else if (
            desc.includes('upah') ||
            desc.includes('gaji') ||
            desc.includes('gajian') ||
            desc.includes('mardi') ||
            desc.includes('kinoy') ||
            desc.includes('iboy')
          )
            summary.upah += item.amount;
          else if (desc.includes('plafon') || desc.includes('genta'))
            summary.plafon += item.amount;
          else if (desc.includes('mitra 10')) summary.mitra += item.amount;
          else summary.others += item.amount;
        }
      });

      labels.push(
        new Date(day.date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
        })
      );
      balances.push(runningBalance);
    });

    return {
      totalDebit,
      totalKredit,
      balance: runningBalance,
      labels,
      balances,
      summary,
    };
  }, []);

  const chartData = {
    labels: stats.labels,
    datasets: [
      {
        data: stats.balances,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 9 }, color: chartTickColor, maxTicksLimit: 10 },
      },
      y: {
        grid: { color: chartGridColor },
        ticks: {
          font: { size: 9 },
          color: chartTickColor,
          callback: (value: number | string) => `${Number(value) / 1_000_000}M`,
        },
      },
    },
  };

  function toggleAll() {
    const next = !isAllExpanded;
    setIsAllExpanded(next);
    const state: Record<string, boolean> = {};
    if (next)
      RENOVATION_DATA.forEach((d) => {
        state[d.date] = true;
      });
    setExpandedItems(state);
  }

  const summaryRows = [
    { label: 'TB Jaya Makmur', value: stats.summary.jm },
    { label: 'Mega Baja', value: stats.summary.mega },
    { label: 'TB Hockey', value: stats.summary.hockey },
    { label: 'Upah Tukang & Gaji', value: stats.summary.upah },
    { label: 'Genta Plafon', value: stats.summary.plafon },
    { label: 'Mitra 10', value: stats.summary.mitra },
    { label: 'Lain-lain (Bojong, Online, dll)', value: stats.summary.others },
  ];

  if (!isAuthenticated) {
    return (
      <VStack spacing={6} align="center" justify="center" minH="60vh">
        <Icon as={FaLock} boxSize={10} color={labelPurple} />
        <Heading size="md">Halaman Dilindungi</Heading>
        <Text fontSize="sm" color={subtitleColor}>
          Masukkan password untuk mengakses laporan ini
        </Text>
        <VStack spacing={3} w="full" maxW="300px">
          <Input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePasswordSubmit();
            }}
            isInvalid={passwordError}
            borderRadius="lg"
          />
          {passwordError && (
            <Text fontSize="xs" color="red.400">
              Password salah
            </Text>
          )}
          <Button colorScheme="purple" w="full" onClick={handlePasswordSubmit}>
            Masuk
          </Button>
        </VStack>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <HStack spacing={2} mb={2}>
          <Box p={2} bg="purple.600" borderRadius="lg" color="white">
            <Icon as={FaHardHat} />
          </Box>
          <Text
            fontSize="xs"
            fontWeight="extrabold"
            letterSpacing="widest"
            color={labelPurple}
            textTransform="uppercase"
          >
            Proyek Renovasi BAF
          </Text>
        </HStack>
        <Heading size="lg">Kuttab Al Fatih Bogor</Heading>
        <Text color={subtitleColor} fontStyle="italic" fontSize="sm">
          Laporan Konsolidasi Baitul Maal Khatulistiwa
        </Text>
      </Box>

      {/* Saldo Akhir */}
      <Box
        bg={cardBg}
        px={5}
        py={4}
        borderRadius="xl"
        shadow="sm"
        border="1px"
        borderColor={borderClr}
        textAlign="right"
      >
        <Text
          fontSize="xs"
          fontWeight="bold"
          color="gray.400"
          textTransform="uppercase"
        >
          Saldo Akhir (Audited)
        </Text>
        <Text fontSize="2xl" fontWeight="extrabold" color={labelPurple}>
          {formatCurrency(stats.balance)}
        </Text>
      </Box>

      {/* Ringkasan Penerimaan */}
      <Box
        bg={cardBg}
        p={5}
        borderRadius="xl"
        shadow="sm"
        border="1px"
        borderColor={borderClr}
      >
        <HStack mb={3}>
          <Icon as={FaMoneyBillWave} color="green.500" />
          <Text fontSize="xs" fontWeight="extrabold" textTransform="uppercase">
            Ringkasan Penerimaan Dana
          </Text>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
          <Box
            p={3}
            bg={greenBoxBg}
            borderRadius="lg"
            border="1px"
            borderColor={greenBoxBorder}
          >
            <Text
              fontSize="9px"
              color={greenBoxLabel}
              fontWeight="bold"
              textTransform="uppercase"
            >
              Taawun Tunai
            </Text>
            <Text fontWeight="bold" fontSize="sm">
              Rp 174.040.200
            </Text>
          </Box>
          <Box
            p={3}
            bg={blueBoxBg}
            borderRadius="lg"
            border="1px"
            borderColor={blueBoxBorder}
          >
            <Text
              fontSize="9px"
              color={blueBoxLabel}
              fontWeight="bold"
              textTransform="uppercase"
            >
              Taawun Rekening
            </Text>
            <Text fontWeight="bold" fontSize="sm">
              Rp 35.283.247
            </Text>
          </Box>
          <Box
            p={3}
            bg={orangeBoxBg}
            borderRadius="lg"
            border="1px"
            borderColor={orangeBoxBorder}
          >
            <Text
              fontSize="9px"
              color={orangeBoxLabel}
              fontWeight="bold"
              textTransform="uppercase"
            >
              Dana Wakpro
            </Text>
            <Text fontWeight="bold" fontSize="sm">
              Rp 128.000.000
            </Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Total Masuk / Keluar */}
      <SimpleGrid columns={2} spacing={3}>
        <Stat
          bg={cardBg}
          p={4}
          borderRadius="xl"
          shadow="sm"
          border="1px"
          borderColor={borderClr}
        >
          <StatLabel fontSize="xs">Total Akumulasi Masuk</StatLabel>
          <StatNumber fontSize="lg" color="green.400">
            {formatCurrency(stats.totalKredit)}
          </StatNumber>
          <Text fontSize="8px" color="gray.400" fontStyle="italic">
            Data bisa tidak akurat, karena AI juga bisa salah
          </Text>
        </Stat>
        <Stat
          bg={cardBg}
          p={4}
          borderRadius="xl"
          shadow="sm"
          border="1px"
          borderColor={borderClr}
        >
          <StatLabel fontSize="xs">Total Akumulasi Keluar</StatLabel>
          <StatNumber fontSize="lg" color="red.400">
            {formatCurrency(stats.totalDebit)}
          </StatNumber>
          <Text fontSize="8px" color="gray.400" fontStyle="italic">
            Data bisa tidak akurat, karena AI juga bisa salah
          </Text>
        </Stat>
      </SimpleGrid>

      {/* Chart */}
      <Box
        bg={cardBg}
        p={5}
        borderRadius="xl"
        shadow="sm"
        border="1px"
        borderColor={borderClr}
      >
        <Text
          fontSize="sm"
          fontWeight="extrabold"
          textTransform="uppercase"
          mb={4}
        >
          Grafik Arus Saldo
        </Text>
        <Box h="200px">
          <Line data={chartData} options={chartOptions as never} />
        </Box>
      </Box>

      {/* Resume Biaya */}
      <Box bg={resumeBg} borderRadius="xl" p={5} color="white">
        <HStack justify="space-between" mb={4}>
          <VStack align="start" spacing={0}>
            <Text
              fontSize="md"
              fontWeight="extrabold"
              fontStyle="italic"
              textTransform="uppercase"
            >
              Resume Biaya Renovasi
            </Text>
            <HStack spacing={1}>
              <Icon as={FaCheckCircle} boxSize={3} color="green.400" />
              <Text fontSize="xs" color="gray.400">
                Penanggung Jawab: A. Indrawan H.
              </Text>
            </HStack>
          </VStack>
          <Icon as={FaReceipt} color="purple.300" opacity={0.5} />
        </HStack>
        <VStack align="stretch" spacing={1} fontSize="xs">
          {summaryRows.map((row) => (
            <HStack
              key={row.label}
              justify="space-between"
              borderBottom="1px"
              borderColor={resumeBorder}
              py={1}
            >
              <Text>{row.label}</Text>
              <Text fontFamily="mono">{formatNumber(row.value)}</Text>
            </HStack>
          ))}
          <Divider borderColor="gray.600" />
          <HStack
            justify="space-between"
            py={1}
            fontWeight="bold"
            color="purple.300"
          >
            <Text>TOTAL PENERIMAAN</Text>
            <Text fontFamily="mono">337.323.447</Text>
          </HStack>
          <HStack
            justify="space-between"
            py={1}
            fontWeight="bold"
            color="red.300"
          >
            <Text>TOTAL PENGELUARAN</Text>
            <Text fontFamily="mono">337.323.447</Text>
          </HStack>
        </VStack>
      </Box>

      {/* Search & Timeline */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="xl"
        shadow="sm"
        border="1px"
        borderColor={borderClr}
      >
        <VStack spacing={3} align="stretch">
          <InputGroup size="sm">
            <InputLeftElement>
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Cari transaksi (Contoh: Semen, PLN, Mitra)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="lg"
            />
          </InputGroup>
          <HStack justify="space-between">
            <HStack>
              <Icon as={FaWallet} color="gray.400" />
              <Text fontWeight="bold" fontSize="sm">
                Histori Ledger
              </Text>
            </HStack>
            <Button
              size="xs"
              variant="ghost"
              colorScheme="purple"
              leftIcon={
                <Icon as={isAllExpanded ? FaCompressAlt : FaExpandAlt} />
              }
              onClick={toggleAll}
            >
              {isAllExpanded ? 'Tutup' : 'Buka Semua'}
            </Button>
          </HStack>
        </VStack>
      </Box>

      <Box maxH="60vh" overflowY="auto" pr={1}>
        {RENOVATION_DATA.slice()
          .reverse()
          .map((day) => (
            <TimelineItem
              key={day.date}
              day={day}
              searchTerm={searchTerm}
              isOpen={!!expandedItems[day.date]}
              toggle={() =>
                setExpandedItems((p) => ({ ...p, [day.date]: !p[day.date] }))
              }
            />
          ))}
        {searchTerm &&
          RENOVATION_DATA.filter((day) =>
            day.items.some((i) =>
              i.desc.toLowerCase().includes(searchTerm.toLowerCase())
            )
          ).length === 0 && (
            <Text textAlign="center" py={10} color="gray.400" fontSize="sm">
              Transaksi tidak ditemukan
            </Text>
          )}
      </Box>
    </VStack>
  );
}
