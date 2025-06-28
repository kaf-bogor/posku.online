/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
  Box,
  Flex,
  Text,
  Heading,
  List,
  ListItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Container,
  VStack,
} from '@chakra-ui/react';
import c3 from 'c3';
import { useEffect, useRef, useState } from 'react';
import 'c3/c3.css';

const sumberDanaData = [
  { sumber: 'Kas Bilistiwa', nominal: 'Rp 1.400.000.000' },
  { sumber: 'Wakaf Hamba Allah', nominal: 'Rp 200.000.000' },
  { sumber: 'Wakaf Mini Soccer', nominal: 'Rp 3.225.000' },
];

// Timeline data array
type TimelineEvent = {
  date: Date;
  title: string;
  desc?: string;
};

const timelineDataRaw: Array<Omit<TimelineEvent, 'date'> & { date: string }> = [
  {
    date: '2025-06-21',
    title: 'Peresmian Wakaf Lahan ATS di Kajian Orang tua',
    desc: 'Total Kebutuhan Rp 2,8 Miliar untuk pembelian tanah, Rp 2 Milyar untuk DP. sisanya dicicil 1 tahun. ditambah kebutuhan Rp. 300 juta untuk renovasi',
  },
  {
    date: '2025-06-24',
    title: 'Laporan kondisi keuangan wakaf',
    desc: 'Total uang muka (DP) sebesar Rp2 miliar, dengan Rp400 juta telah dibayarkan sebagai uang muka awal. Saat ini tersedia Rp1,4 miliar di rekening wakaf, sehingga masih terdapat kekurangan sebesar Rp200 juta untuk melunasi DP tersebut. Pak Fadil telah meminta agar pelunasan dilakukan pada hari Senin, agar akad jual beli dan wakaf dapat segera ditandatangani serta proses AIW bisa segera dimulai.',
  },
  {
    date: '2025-06-27',
    title: 'Tambahan dana Rp. 200 Juta',
    desc: 'Wakaf dari hamba Allah.',
  },
  {
    date: '2025-06-27',
    title: 'Tambahan dana Rp. 3,2 Juta.',
    desc: 'Wakaf dari komunitas mini soccer.',
  },
  {
    date: '2025-06-30',
    title: 'Pelunasan DP',
    desc: '',
  },
];

const timelineData: TimelineEvent[] = timelineDataRaw
  .map((event) => ({ ...event, date: new Date(event.date) }))
  .sort((a, b) => b.date.getTime() - a.date.getTime());

function parseRupiahToNumber(rupiah: string) {
  return Number(rupiah.replace(/[^\d]/g, ''));
}

const App = () => {
  const chartRef = useRef(null);
  // State to track if C3.js and D3.js scripts are loaded
  // Initial data for the chart and display
  const totalGoal = 3100000000; // Rp 3.1 Milyar
  const currentCollected = sumberDanaData.reduce(
    (sum, row) => sum + parseRupiahToNumber(row.nominal),
    0
  );
  const remainingNeeded = totalGoal - currentCollected;

  // State for the currently displayed collected amount (can be updated dynamically if needed)
  const [displayedCollected] = useState(currentCollected);

  useEffect(() => {
    if (chartRef.current) {
      const chart = c3.generate({
        bindto: chartRef.current,
        data: {
          columns: [
            ['Terkumpul', currentCollected],
            ['Sisa Kebutuhan', remainingNeeded],
          ],
          type: 'pie',
          colors: {
            Terkumpul: '#16a34a',
            'Sisa Kebutuhan': '#6B46C1',
          },
          names: {
            Terkumpul: 'Dana Terkumpul',
            'Sisa Kebutuhan': 'Sisa Kebutuhan Dana',
          },
        },
        donut: {
          title: 'Progres Dana',
        },
        tooltip: {
          format: {
            value(value: { toLocaleString: (arg0: string) => any }) {
              return `Rp ${value.toLocaleString('id-ID')}`;
            },
          },
        },
        legend: {
          position: 'right',
        },
      });
      return () => {
        chart.destroy();
      };
    }
    return undefined;
  }, [currentCollected, remainingNeeded]); // Re-run effect when data changes

  return (
    <Box
      p={{ base: 4, sm: 6, md: 8 }}
      fontFamily="Inter"
      bg="gray.100"
      minH="100vh"
    >
      <Container maxW="4xl" mx="auto">
        <VStack as="header" textAlign="center" mb={10} spacing={4}>
          <Heading
            as="h1"
            fontSize={{ base: '4xl', sm: '5xl' }}
            fontWeight="extrabold"
            color="blue.800"
          >
            Wakaf Lahan ATS
          </Heading>
          <Text fontSize={{ base: 'lg', sm: 'xl' }} color="gray.700">
            Penggalangan Dana untuk Pembebasan dan Renovasi Lahan Sekolah di Jl.
            Atang Sendjaja, Bogor.
          </Text>
        </VStack>

        <VStack gap={8}>
          {/* Progress Chart (Top Right Column) */}
          <Flex
            className="card"
            bg="white"
            rounded="xl"
            shadow="md"
            p={6}
            direction="column"
            justifyContent="space-between"
            w="full"
          >
            <Heading
              as="h2"
              fontSize="3xl"
              fontWeight="bold"
              color="gray.800"
              mb={6}
              textAlign="center"
            >
              Progres Penggalangan Dana
            </Heading>
            <Box ref={chartRef} w="full" h="64" />
            <VStack textAlign="center" mt={6} spacing={2}>
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                Dana Terkumpul:
              </Text>
              <Text
                fontSize="4xl"
                fontWeight="extrabold"
                color="green.600"
              >{`Rp ${displayedCollected.toLocaleString('id-ID')}`}</Text>
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                Dari Total Dana yang diperlukan :
              </Text>
              <Text
                fontSize="4xl"
                fontWeight="extrabold"
                color="purple.600"
              >{`Rp ${totalGoal.toLocaleString('id-ID')}`}</Text>
              <Button
                mt={6}
                bg="purple.600"
                _hover={{ bg: 'purple.700' }}
                color="white"
                fontWeight="bold"
                py={3}
                px={8}
                rounded="full"
                shadow="lg"
                transition="all 0.3s ease-in-out"
                _active={{ transform: 'scale(0.95)' }}
              >
                Donasi Sekarang!
              </Button>
            </VStack>
          </Flex>

          {/* Funding Goal and Details (Full Width Below) */}
          <Box
            as="section"
            gridColumn={{ base: 'span 1', lg: 'span 2' }}
            className="card"
            bg="white"
            rounded="xl"
            shadow="md"
            p={6}
          >
            <Heading
              as="h2"
              fontSize="3xl"
              fontWeight="bold"
              color="gray.800"
              mb={6}
            >
              Target Dana & Kebutuhan
            </Heading>
            <Box mb={6}>
              <Text
                fontSize="2xl"
                fontWeight="semibold"
                color="gray.900"
                mb={2}
              >
                Total Kebutuhan Dana:{' '}
                <Text as="span" color="green.600">
                  Rp 3.100.000.000
                </Text>
              </Text>
              <List styleType="disc" color="gray.700" spacing={2} ml={4}>
                <ListItem>
                  <Text as="span" fontWeight="medium">
                    Harga Tanah:
                  </Text>{' '}
                  Rp 2.800.000.000
                </ListItem>
                <ListItem>
                  <Text as="span" fontWeight="medium">
                    Renovasi Bangunan:
                  </Text>{' '}
                  Rp 300.000.000
                </ListItem>
              </List>
            </Box>

            <Box
              bg="blue.50"
              p={4}
              rounded="lg"
              borderLeft="4px"
              borderColor="blue.500"
              mb={6}
            >
              <Text fontSize="lg" color="gray.800" mb={2}>
                Termin pembayaran ke pemilik tanah:
              </Text>
              <List styleType="disc" color="gray.700" spacing={2} ml={4}>
                <ListItem>
                  <Text as="span" fontWeight="medium">
                    Uang Muka (DP):
                  </Text>{' '}
                  Rp 2.000.000.000
                </ListItem>
                <ListItem fontWeight="bold" color="red.600">
                  Batas Waktu DP: Senin, 30 Juni 2025
                </ListItem>
                <ListItem>
                  <Text as="span" fontWeight="medium">
                    Cicilan:
                  </Text>{' '}
                  Rp 800.000.000 (dicicil selama 1 tahun)
                </ListItem>
              </List>
            </Box>

            <Box
              bg="yellow.50"
              p={4}
              rounded="lg"
              borderLeft="4px"
              borderColor="yellow.500"
            >
              <Text fontSize="lg" color="gray.800" mb={2}>
                Kebutuhan Renovasi:
              </Text>
              <List styleType="disc" color="gray.700" spacing={2} ml={4}>
                <ListItem>
                  <Text as="span" fontWeight="medium">
                    Dana Renovasi:
                  </Text>{' '}
                  Rp 300.000.000
                </ListItem>
                <ListItem fontWeight="bold" color="orange.600">
                  Bangunan sekolah diharapkan bisa ditempati pada 1 Agustus 2026
                  (Tahun Ajaran 2026/2027).
                </ListItem>
              </List>
            </Box>
          </Box>

          {/* Nominal Updates Section (Top Left Column) */}
          <Box
            className="card"
            bg="white"
            rounded="xl"
            shadow="md"
            p={6}
            w="full"
          >
            <Heading
              as="h2"
              fontSize="3xl"
              fontWeight="bold"
              color="gray.800"
              mb={6}
              textAlign="center"
            >
              Pembaruan Nominal Dana
            </Heading>
            <Box overflowX="auto">
              <Table
                variant="simple"
                bg="white"
                border="1px"
                borderColor="gray.200"
                rounded="lg"
              >
                <Thead>
                  <Tr bg="gray.100" borderBottom="1px" borderColor="gray.200">
                    <Th
                      px={6}
                      py={3}
                      textAlign="left"
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.600"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Sumber Dana
                    </Th>
                    <Th
                      px={6}
                      py={3}
                      textAlign="right"
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.600"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Nominal
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sumberDanaData.map((row) => (
                    <Tr key={row.sumber} _hover={{ bg: 'gray.50' }}>
                      <Td
                        px={6}
                        py={4}
                        whiteSpace="nowrap"
                        fontSize="lg"
                        color="gray.900"
                      >
                        {row.sumber}
                      </Td>
                      <Td
                        px={6}
                        py={4}
                        whiteSpace="nowrap"
                        textAlign="right"
                        fontSize="lg"
                        fontWeight="medium"
                        color="green.700"
                      >
                        {row.nominal}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>

          {/* Timeline Section */}
          <Box
            className="card"
            bg="white"
            rounded="xl"
            shadow="md"
            p={6}
            mb={10}
          >
            <Heading
              as="h2"
              fontSize="3xl"
              fontWeight="bold"
              color="gray.800"
              mb={6}
              textAlign="center"
            >
              Linimasa & Pembaruan Terakhir
            </Heading>
            <Box position="relative" pl={8}>
              <Box
                position="absolute"
                w="1"
                h="full"
                bg="gray.300"
                rounded="full"
              />
              {timelineData.map(
                (event): JSX.Element => (
                  <Box
                    mb={8}
                    position="relative"
                    key={event.date.toISOString() + (event.title || '')}
                  >
                    <Flex alignItems="center">
                      <Box
                        position="absolute"
                        ml="-2"
                        w="4"
                        h="4"
                        bg={event.date > new Date() ? 'orange.600' : 'blue.500'}
                        rounded="full"
                        zIndex="1"
                      />
                      <Text
                        ml={{ base: 6, sm: 12 }}
                        fontSize="lg"
                        fontWeight="semibold"
                        color="gray.800"
                      >
                        {event.date.toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}{' '}
                        {event.date > new Date() ? ' (Akan datang)' : ''}
                      </Text>
                    </Flex>
                    <Box
                      ml={{ base: 6, sm: 12 }}
                      color="gray.700"
                      mt={2}
                      p={3}
                      bg="blue.50"
                      borderLeft="4px"
                      borderColor={
                        event.date > new Date() ? 'orange.600' : 'blue.500'
                      }
                      rounded="lg"
                      shadow="sm"
                    >
                      {event.title && (
                        <Text>
                          <Text as="span" fontWeight="bold">
                            {event.title}
                          </Text>
                        </Text>
                      )}
                      {event.desc && <Text>{event.desc}</Text>}
                    </Box>
                  </Box>
                )
              )}
            </Box>
          </Box>
        </VStack>

        <Box as="footer" textAlign="center" color="gray.600" mt={10} p={4}>
          <Text>&copy; 2025 Wakaf Lahan ATS. Semua hak dilindungi.</Text>
        </Box>
      </Container>
    </Box>
  );
};

export default App;
