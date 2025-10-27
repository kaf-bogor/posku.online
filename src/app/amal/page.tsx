'use client';

import {
  VStack,
  Heading,
  Text,
  Spinner,
  Center,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaHandsHelping } from 'react-icons/fa';

import DonationCard from '../admin/components/DonationCard';
import ContentWrapper from '../components/ContentWrapper';
import { db } from '~/lib/firebase';
import type { DonationPage } from '~/lib/types/donation';

const AmalPage = () => {
  // Color theme - Must be called first and in consistent order
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const titleColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('green.500', 'green.400');

  // State hooks
  const [campaigns, setCampaigns] = useState<DonationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchCampaigns = async () => {
      try {
        // Query only active campaigns from Firebase
        const q = query(
          collection(db, 'donations'),
          where('is_active', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const data: DonationPage[] = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as DonationPage
        );
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
      <ContentWrapper>
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
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text color={textColor}>Memuat kampanye Amal...</Text>
        </VStack>
      </ContentWrapper>
    );
  }

  if (!campaigns.length) {
    return (
      <ContentWrapper>
        <VStack spacing={6}>
          <VStack spacing={4} textAlign="center">
            <FaHandsHelping fontSize="64px" color={accentColor} />
            <Heading size="lg" color={titleColor}>
              Belum Ada Kampanye Amal
            </Heading>
            <Text color={textColor} maxW="400px">
              Saat ini belum ada kampanye amal yang tersedia. Silakan kembali
              lagi nanti.
            </Text>
          </VStack>
        </VStack>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper withBg={false} withPadding={false}>
      <VStack spacing={6} align="stretch">
        <VStack w="100%" justify="space-between" align="center">
          <Heading
            size="2xl"
            color={titleColor}
            textAlign="center"
            fontWeight="bold"
          >
            Amal
          </Heading>
          <Text color={textColor} fontSize="md" textAlign="center">
            Wujudkan peradaban yang mulia melalui sinergi wakaf, ta’awun, dan
            infaq
          </Text>
        </VStack>

        {/* Campaigns List - Single Column */}
        <VStack spacing={6} align="stretch">
          {campaigns.map((campaign) => {
            return <DonationCard key={campaign.id} donation={campaign} />;
          })}
        </VStack>
      </VStack>
    </ContentWrapper>
  );
};

export default AmalPage;
