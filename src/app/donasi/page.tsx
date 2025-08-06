'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Spinner,
  Center,
  useColorModeValue,
  IconButton,
  Container,
} from '@chakra-ui/react';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaHandsHelping } from 'react-icons/fa';

import DonationCard from '../admin/components/DonationCard';
import { db } from '~/lib/firebase';
import type { DonationPage } from '~/lib/types/donation';

const DonasiPage = () => {
  // Color theme - Must be called first and in consistent order
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const titleColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('green.500', 'green.400');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  // State hooks
  const [campaigns, setCampaigns] = useState<DonationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchCampaigns = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'donations'));
        const allData: DonationPage[] = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as DonationPage
        );

        // Temporarily show all donations for debugging
        const data = allData; // Remove filter to see all donations
        // const data = allData.filter((campaign) => campaign.published);
        setCampaigns(data);
      } catch {
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Center minH="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text color="gray.500">Loading...</Text>
        </VStack>
      </Center>
    );
  }

  if (loading) {
    return (
      <Center minH="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text color={textColor}>Memuat kampanye donasi...</Text>
        </VStack>
      </Center>
    );
  }

  if (!campaigns.length) {
    return (
      <Container maxW="container.md" py={12}>
        <VStack spacing={6}>
          <IconButton
            aria-label="Kembali"
            icon={<FaArrowLeft />}
            variant="ghost"
            size="sm"
            alignSelf="flex-start"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.history.back();
              }
            }}
          />
          <Center
            minH="40vh"
            bg={cardBg}
            borderRadius="2xl"
            p={12}
            w="100%"
            boxShadow="sm"
          >
            <VStack spacing={4} textAlign="center">
              <FaHandsHelping fontSize="64px" color={accentColor} />
              <Heading size="lg" color={titleColor}>
                Belum Ada Kampanye Donasi
              </Heading>
              <Text color={textColor} maxW="400px">
                Saat ini belum ada kampanye donasi yang tersedia. Silakan
                kembali lagi nanti.
              </Text>
            </VStack>
          </Center>
        </VStack>
      </Container>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" pb={8}>
      <Container maxW="container.md">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack spacing={4} pt={4}>
            <HStack w="100%" justify="space-between" align="center">
              <IconButton
                aria-label="Kembali"
                icon={<FaArrowLeft />}
                variant="ghost"
                size="md"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.history.back();
                  }
                }}
                _hover={{ bg: hoverBg }}
              />
              <VStack spacing={1} flex={1}>
                <Heading
                  size="2xl"
                  color={titleColor}
                  textAlign="center"
                  fontWeight="bold"
                >
                  Donasi
                </Heading>
                <Text color={textColor} fontSize="md" textAlign="center">
                  Mari bersama membantu membangun peradaban
                </Text>
              </VStack>
              <Box w="40px" />
            </HStack>
          </VStack>

          {/* Campaigns List - Single Column */}
          <VStack spacing={6} align="stretch">
            {campaigns.map((campaign) => {
              return <DonationCard key={campaign.id} donation={campaign} />;
            })}
          </VStack>

          {/* Call to Action */}
          <Box
            bg={cardBg}
            borderRadius="2xl"
            p={8}
            textAlign="center"
            boxShadow="md"
            mt={8}
          >
            <VStack spacing={4}>
              <FaHandsHelping fontSize="48px" color={accentColor} />
              <VStack spacing={2}>
                <Heading size="lg" color={titleColor}>
                  Setiap Donasi Berharga
                </Heading>
                <Text color={textColor} maxW="500px">
                  Dukungan Anda, sekecil apapun, adalah langkah nyata untuk
                  membangun peradaban
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default DonasiPage;
