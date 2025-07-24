/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
  Box,
  Text,
  Heading,
  List,
  ListItem,
  Button,
  Container,
  VStack,
  HStack,
  Link,
} from '@chakra-ui/react';
import { useState, useEffect, useContext } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import { AppContext, siteConfig } from '~/lib/context/app';
import { storageUrl } from '~/lib/context/baseUrl';

import NominalUpdates from './Donors';
import ProgressChart from './ProgressChart';
import Timeline from './Timeline';

const App = () => {
  // AppContext for title/subtitle
  const { setTitle, setSubtitle, setImage } = useContext(AppContext);
  const { textColor } = useContext(AppContext);

  // Initial data for the chart and display
  const totalGoal = 3100000000; // Rp 3.1 Milyar
  const currentCollected = 1603225000; // Rp 1.6 Milyar (example)

  // State for the currently displayed collected amount (can be updated dynamically if needed)
  const [displayedCollected] = useState(currentCollected);

  useEffect(() => {
    setTitle('Baitul Maal Khatulistiwa');
    setSubtitle('Bilistiwa - Laporan wakaf ATS');
    setImage(`${storageUrl}/bilistiwa.jpg?alt=media`);
    return () => {
      setImage(siteConfig.image);
      setTitle(siteConfig.title);
      setSubtitle(siteConfig.subtitle);
    };
  }, [setImage, setTitle, setSubtitle]);

  return (
    <Box p={{ base: 4, sm: 6, md: 8 }} minH="100vh" overflowX="hidden">
      <Link href="/" color={textColor}>
        <HStack my={6}>
          <FaArrowLeft />
          <Text>Kembali</Text>
        </HStack>
      </Link>
      <Container
        maxW="lg"
        w="full"
        mx="auto"
        px={{ base: 2, sm: 4 }}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <VStack
          as="header"
          textAlign="center"
          mb={10}
          spacing={4}
          w="full"
          alignItems="center"
          maxW="md"
        >
          <Heading
            as="h1"
            fontSize={{ base: '4xl', sm: '5xl' }}
            fontWeight="extrabold"
            color={textColor}
          >
            Wakaf Lahan ATS
          </Heading>
          <Text fontSize={{ base: 'lg', sm: 'xl' }} color={textColor}>
            Penggalangan Dana untuk Pembebasan dan Renovasi Lahan Sekolah Kuttab
            Al-Fatih Bogor
          </Text>
          <Text fontSize={{ base: 'lg', sm: 'xl' }} color={textColor}>
            di Jl. Atang Sendjaja, Bogor.
          </Text>
        </VStack>

        <VStack gap={8}>
          {/* Progress Chart (Top Right Column) */}
          <Box
            as="section"
            gridColumn={{ base: 'span 1', lg: 'span 2' }}
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
              Progres Penggalangan Dana
            </Heading>
            <ProgressChart
              currentCollected={displayedCollected}
              remainingNeeded={totalGoal - displayedCollected}
            />
            <VStack textAlign="center" mt={6} spacing={0} gap={4}>
              <Box>
                <Text fontSize="xl" fontWeight="bold" color="gray.800">
                  Dana Terkumpul:
                </Text>
                <Text
                  fontSize="4xl"
                  fontWeight="extrabold"
                  color="green.600"
                >{`Rp ${displayedCollected.toLocaleString('id-ID')}`}</Text>
              </Box>
              <Box>
                <Text fontSize="xl" fontWeight="bold" color="gray.800">
                  Dari Total Dana yang diperlukan :
                </Text>
                <Text
                  fontSize="4xl"
                  fontWeight="extrabold"
                  color="purple.600"
                  whiteSpace="nowrap"
                >{`Rp ${totalGoal.toLocaleString('id-ID')}`}</Text>
              </Box>
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
              <Box mt={4} textAlign="center">
                <Text fontWeight="bold" color="gray.800" fontSize="lg">
                  BSI
                </Text>
                <Text
                  fontWeight="extrabold"
                  color="green.700"
                  fontSize="2xl"
                  letterSpacing="wide"
                >
                  7123309547
                </Text>
                <Text fontWeight="semibold" color="gray.600" fontSize="md">
                  WAKAF KUTTAB ALFATIH BOGOR
                </Text>
              </Box>
            </VStack>
          </Box>

          <NominalUpdates donors={[]} />

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
              textAlign="center"
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
                  Bangunan sekolah diharapkan bisa ditempati pada 1 Agustus 2025
                  (Tahun Ajaran 2026/2027).
                </ListItem>
              </List>
            </Box>
          </Box>

          {/* Nominal Updates Section */}
          <NominalUpdates donors={[]} />

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
