/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
  Box,
  Flex,
  Text,
  Heading,
  List,
  ListItem,
  Button,
  Container,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';

import NominalUpdates from './NominalUpdates';
import ProgressChart from './ProgressChart';
import Timeline from './Timeline';

const App = () => {
  // Initial data for the chart and display
  const totalGoal = 3100000000; // Rp 3.1 Milyar
  const currentCollected = 1603225000; // Rp 1.6 Milyar (example)

  // State for the currently displayed collected amount (can be updated dynamically if needed)
  const [displayedCollected] = useState(currentCollected);

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
            <ProgressChart
              currentCollected={displayedCollected}
              remainingNeeded={totalGoal - displayedCollected}
            />
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

          {/* Nominal Updates Section */}
          <NominalUpdates />

          {/* Timeline Section */}
          <Timeline />
        </VStack>

        <Box as="footer" textAlign="center" color="gray.600" mt={10} p={4}>
          <Text>&copy; 2025 Wakaf Lahan ATS. Semua hak dilindungi.</Text>
        </Box>
      </Container>
    </Box>
  );
};

export default App;
