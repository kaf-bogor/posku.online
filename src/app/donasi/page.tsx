'use client';

import {
  Box,
  HStack,
  Image,
  Heading,
  Text,
  Button,
  Spinner,
  Center,
} from '@chakra-ui/react';
import DOMPurify from 'dompurify';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import { db } from '~/lib/firebase';
import type { DonationPage } from '~/lib/types/donation';

const DonasiPage = () => {
  const [campaigns, setCampaigns] = useState<DonationPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'donations'));
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

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!campaigns.length) {
    return (
      <Center minH="60vh">
        <Text>Data donasi tidak ditemukan.</Text>
      </Center>
    );
  }

  return (
    <Box width="100%" mb={12}>
      <Box as="button" onClick={() => window.history.back()}>
        <HStack my={6}>
          <FaArrowLeft />
          <Text>Kembali</Text>
        </HStack>
      </Box>
      <Box
        display="grid"
        gridTemplateColumns={['1fr', null, '1fr 1fr']}
        gap={6}
        mx="auto"
        maxW="900px"
        mt={4}
      >
        {campaigns.map((campaign) => (
          <Box
            key={campaign.id}
            bg="white"
            borderRadius="lg"
            boxShadow="md"
            p={4}
          >
            <Image
              src={campaign.imageUrls?.[0] || ''}
              alt={campaign.title}
              borderRadius="md"
              objectFit="cover"
              w="full"
              h={['180px', '220px']}
              mb={4}
            />
            <Heading as="h2" size="md" mb={2} color="gray.800">
              {campaign.title}
            </Heading>
            <Text
              fontSize="sm"
              color="gray.700"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(campaign.summary).slice(0, 550),
              }}
            />
            <Link
              href={`/donasi/${campaign.id}` || '/donasi/wakaf_ats'}
              passHref
              legacyBehavior
            >
              <Button colorScheme="green" w="full" mt={4}>
                Lihat detail
              </Button>
            </Link>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DonasiPage;
