/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
  ChakraProvider,
  extendTheme,
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

// Extend the Chakra UI theme to include Inter font and custom colors
const theme = extendTheme({
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  colors: {
    blue: {
      800: '#2A4365', // Darker blue for headings
      500: '#3182CE', // Standard blue
      50: '#EBF8FF', // Light blue for backgrounds
    },
    purple: {
      600: '#805AD5', // Main purple for buttons/text
      700: '#6B46C1', // Darker purple for hover
      50: '#F0F5FA', // Chakra's light purple-ish background
      60: '#C4B5FD', // Light purple for chart
    },
    green: {
      600: '#38A169', // Green for positive numbers
      700: '#276749', // Darker green for text
      500: '#38A169', // For timeline dot
      50: '#F0FFF4', // Light green background
    },
    red: {
      600: '#E53E3E', // Red for deadlines
      500: '#E53E3E', // For timeline dot
      50: '#FFF5F5', // Light red background
    },
    yellow: {
      500: '#ECC94B', // Yellow for renovation target
      50: '#FFFFF0', // Light yellow background
    },
    orange: {
      600: '#ED8936', // Orange for renovation details
      500: '#ED8936', // For timeline dot
      50: '#FFF8E1', // Light orange background
    },
    gray: {
      800: '#2D3748', // Dark gray for text
      700: '#4A5568', // Medium gray for text
      600: '#718096', // Light gray for text/borders
      300: '#E2E8F0', // Very light gray for borders/lines
      100: '#F7FAFC', // Lighter gray for table header
      50: '#F9FAFB', // Lightest gray for hover
    },
  },
});

const sumberDanaData = [
  { sumber: 'Kas Bilistiwa', nominal: 'Rp 1.400.000.000' },
  { sumber: 'Pengumpulan Dana Ramadhan', nominal: 'Rp 200.000.000' },
  { sumber: 'Wakaf Hamba Allah', nominal: 'Rp 200.000.000' },
  { sumber: 'Wakaf Anak-anak Kuttab', nominal: 'Rp 5.000.000' },
];

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
            Terkumpul: theme.colors.purple[600],
            'Sisa Kebutuhan': theme.colors.purple[60],
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
    <ChakraProvider theme={theme}>
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
              Penggalangan Dana untuk Pembebasan dan Renovasi Lahan Sekolah di
              Jl. Atang Sendjaja, Bogor.
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
                  color="purple.600"
                >{`Rp ${displayedCollected.toLocaleString('id-ID')}`}</Text>
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
                    Bangunan sekolah diharapkan bisa ditempati pada 1 Agustus
                    2026 (Tahun Ajaran 2026/2027).
                  </ListItem>
                </List>
              </Box>
            </Box>
          </VStack>

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
            <Box position="relative" pl={{ base: 8, sm: 16 }}>
              <Box
                position="absolute"
                left={{ base: 0, sm: '6' }}
                w="1"
                h="full"
                bg="gray.300"
                rounded="full"
              />

              <Box mb={8} position="relative">
                <Flex alignItems="center">
                  <Box
                    position="absolute"
                    left={{ base: 0, sm: '6' }}
                    ml="-2"
                    w="4"
                    h="4"
                    bg="blue.500"
                    rounded="full"
                    zIndex="1"
                  />
                  <Text
                    ml={{ base: 6, sm: 12 }}
                    fontSize="lg"
                    fontWeight="semibold"
                    color="gray.800"
                  >
                    27 Juni 2025
                  </Text>
                </Flex>
                <Box
                  ml={{ base: 6, sm: 12 }}
                  color="gray.700"
                  mt={2}
                  p={3}
                  bg="blue.50"
                  rounded="lg"
                  shadow="sm"
                >
                  <Text>
                    <Text as="span" fontWeight="bold">
                      Peluncuran Halaman Crowdfunding Wakaf Lahan ATS.
                    </Text>
                  </Text>
                  <Text>
                    Total DP Rp 2 Miliar. Rp 400 Juta telah dibayarkan sebagai
                    uang muka awal. Rp 1.4 Miliar sudah ada di rekening wakaf.
                    Kekurangan Rp 200 Juta lagi untuk melunasi DP.
                  </Text>
                </Box>
              </Box>

              <Box mb={8} position="relative">
                <Flex alignItems="center">
                  <Box
                    position="absolute"
                    left={{ base: 0, sm: '6' }}
                    ml="-2"
                    w="4"
                    h="4"
                    bg="red.500"
                    rounded="full"
                    zIndex="1"
                  />
                  <Text
                    ml={{ base: 6, sm: 12 }}
                    fontSize="lg"
                    fontWeight="semibold"
                    color="gray.800"
                  >
                    30 Juni 2025
                  </Text>
                </Flex>
                <Box
                  ml={{ base: 6, sm: 12 }}
                  color="gray.700"
                  mt={2}
                  p={3}
                  bg="red.50"
                  rounded="lg"
                  shadow="sm"
                >
                  <Text>
                    <Text as="span" fontWeight="bold">
                      Batas Waktu Pelunasan Uang Muka (DP) Rp 2 Miliar.
                    </Text>
                  </Text>
                  <Text>
                    Dana sebesar Rp 200 Juta sangat dibutuhkan untuk melengkapi
                    DP agar akad jual beli dan wakaf dapat segera ditandatangani
                    dan AIW (Akta Ikrar Wakaf) dapat diurus.
                  </Text>
                </Box>
              </Box>

              <Box mb={8} position="relative">
                <Flex alignItems="center">
                  <Box
                    position="absolute"
                    left={{ base: 0, sm: '6' }}
                    ml="-2"
                    w="4"
                    h="4"
                    bg="orange.500"
                    rounded="full"
                    zIndex="1"
                  />
                  <Text
                    ml={{ base: 6, sm: 12 }}
                    fontSize="lg"
                    fontWeight="semibold"
                    color="gray.800"
                  >
                    Akhir Juli 2025 (Target)
                  </Text>
                </Flex>
                <Box
                  ml={{ base: 6, sm: 12 }}
                  color="gray.700"
                  mt={2}
                  p={3}
                  bg="orange.50"
                  rounded="lg"
                  shadow="sm"
                >
                  <Text>
                    <Text as="span" fontWeight="bold">
                      Target Pengumpulan Dana Renovasi Rp 300 Juta.
                    </Text>
                  </Text>
                  <Text>
                    Prioritas kedua adalah dana renovasi agar seluruh kelas siap
                    digunakan pada 1 Agustus 2026 (Tahun Ajaran 2026/2027).
                  </Text>
                </Box>
              </Box>

              <Box mb={8} position="relative">
                <Flex alignItems="center">
                  <Box
                    position="absolute"
                    left={{ base: 0, sm: '6' }}
                    ml="-2"
                    w="4"
                    h="4"
                    bg="yellow.500"
                    rounded="full"
                    zIndex="1"
                  />
                  <Text
                    ml={{ base: 6, sm: 12 }}
                    fontSize="lg"
                    fontWeight="semibold"
                    color="gray.800"
                  >
                    1 Agustus 2026
                  </Text>
                </Flex>
                <Box
                  ml={{ base: 6, sm: 12 }}
                  color="gray.700"
                  mt={2}
                  p={3}
                  bg="yellow.50"
                  rounded="lg"
                  shadow="sm"
                >
                  <Text>
                    <Text as="span" fontWeight="bold">
                      Target Penyelesaian Renovasi & Sekolah Siap Digunakan.
                    </Text>
                  </Text>
                  <Text>
                    Bangunan sekolah diharapkan sudah direnovasi dan siap
                    ditempati untuk tahun ajaran 2026/2027.
                  </Text>
                </Box>
              </Box>

              <Box mb={8} position="relative">
                <Flex alignItems="center">
                  <Box
                    position="absolute"
                    left={{ base: 0, sm: '6' }}
                    ml="-2"
                    w="4"
                    h="4"
                    bg="green.500"
                    rounded="full"
                    zIndex="1"
                  />
                  <Text
                    ml={{ base: 6, sm: 12 }}
                    fontSize="lg"
                    fontWeight="semibold"
                    color="gray.800"
                  >
                    Update Mendatang (dalam 1 tahun setelah DP)
                  </Text>
                </Flex>
                <Box
                  ml={{ base: 6, sm: 12 }}
                  color="gray.700"
                  mt={2}
                  p={3}
                  bg="green.50"
                  rounded="lg"
                  shadow="sm"
                >
                  <Text>
                    <Text as="span" fontWeight="bold">
                      Pembayaran Cicilan Rp 800 Juta.
                    </Text>
                  </Text>
                  <Text>
                    Penyelesaian pembayaran cicilan sisa harga tanah akan
                    diumumkan di sini.
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box as="footer" textAlign="center" color="gray.600" mt={10} p={4}>
            <Text>&copy; 2025 Wakaf Lahan ATS. Semua hak dilindungi.</Text>
          </Box>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default App;
