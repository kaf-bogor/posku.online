'use client';

import {
  Box,
  VStack,
  HStack,
  Image,
  Heading,
  Text,
  Button,
  Spinner,
  Center,
  Progress,
  Badge,
  useColorModeValue,
  SimpleGrid,
  IconButton,
  Flex,
  Container,
} from '@chakra-ui/react';
import DOMPurify from 'dompurify';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaUsers, FaHeart, FaHandsHelping } from 'react-icons/fa';

import { db } from '~/lib/firebase';
import type { DonationPage } from '~/lib/types/donation';
import { formatIDR } from '~/lib/utils/currency';

const DonasiPage = () => {
  // Color theme - Must be called first and in consistent order
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const titleColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('green.500', 'green.400');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const progressBg = useColorModeValue('gray.100', 'gray.600');
  const heartColor = useColorModeValue('red.500', 'red.400');
  const iconColor = useColorModeValue('gray.400', 'gray.500');

  // State hooks
  const [campaigns, setCampaigns] = useState<DonationPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'donations'));
        const data: DonationPage[] = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as DonationPage)
          .filter((campaign) => campaign.published);
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
            onClick={() => window.history.back()}
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
                Saat ini belum ada kampanye donasi yang tersedia. Silakan kembali lagi nanti.
              </Text>
            </VStack>
          </Center>
        </VStack>
      </Container>
    );
  }

  const calculateProgress = (collected: number, target: number) => {
    return target > 0 ? Math.min((collected / target) * 100, 100) : 0;
  };

  const getTotalCollected = (donors: any[]) => {
    return donors?.reduce((total, donor) => total + (donor.value || 0), 0) || 0;
  };

  return (
    <Box bg={bgColor} minH="100vh" pb={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} pt={4}>
            <HStack w="100%" justify="space-between" align="center">
              <IconButton
                aria-label="Kembali"
                icon={<FaArrowLeft />}
                variant="ghost"
                size="md"
                onClick={() => window.history.back()}
                _hover={{ bg: hoverBg }}
              />
              <VStack spacing={1} flex={1}>
                <Heading 
                  size="xl" 
                  color={titleColor}
                  textAlign="center"
                  fontWeight="bold"
                >
                  Kampanye Donasi
                </Heading>
                <Text color={textColor} fontSize="sm" textAlign="center">
                  Mari bersama membantu sesama
                </Text>
              </VStack>
              <Box w="40px" />
            </HStack>
          </VStack>

          {/* Campaigns Grid */}
          <SimpleGrid 
            columns={{ base: 1, md: 2, lg: 3 }} 
            spacing={{ base: 6, md: 8 }} 
          >
            {campaigns.map((campaign) => {
              const totalCollected = getTotalCollected(campaign.donors);
              const progress = calculateProgress(totalCollected, campaign.target);
              const donorsCount = campaign.donors?.length || 0;

              return (
                <Box
                  key={campaign.id}
                  bg={cardBg}
                  borderRadius="2xl"
                  overflow="hidden"
                  boxShadow="lg"
                  transition="all 0.3s ease"
                  _hover={{
                    transform: 'translateY(-8px)',
                    boxShadow: '2xl',
                  }}
                  border="1px solid"
                  borderColor={borderColor}
                >
                  {/* Campaign Image */}
                  <Box position="relative" overflow="hidden">
                    <Image
                      src={campaign.imageUrls?.[0] || ''}
                      alt={campaign.title}
                      w="100%"
                      h={{ base: "200px", md: "240px" }}
                      objectFit="cover"
                      transition="transform 0.3s ease"
                      _hover={{ transform: 'scale(1.05)' }}
                    />
                    <Box
                      position="absolute"
                      top={4}
                      right={4}
                      bg="rgba(255, 255, 255, 0.9)"
                      backdropFilter="blur(10px)"
                      borderRadius="full"
                      p={2}
                    >
                      <FaHeart color={heartColor} />
                    </Box>
                  </Box>

                  {/* Campaign Content */}
                  <VStack spacing={4} p={6} align="stretch">
                    {/* Title */}
                    <Heading 
                      as="h3" 
                      size="md" 
                      color={titleColor}
                      lineHeight="shorter"
                      noOfLines={2}
                      fontWeight="bold"
                    >
                      {campaign.title}
                    </Heading>

                    {/* Summary */}
                    <Text
                      fontSize="sm"
                      color={textColor}
                      lineHeight="relaxed"
                      noOfLines={3}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(campaign.summary).slice(0, 150) + '...',
                      }}
                    />

                    {/* Progress Section */}
                    <VStack spacing={3} align="stretch">
                      {/* Progress Bar */}
                      <Box>
                        <Progress
                          value={progress}
                          colorScheme="green"
                          size="lg"
                          borderRadius="full"
                          bg={progressBg}
                        />
                      </Box>

                      {/* Stats */}
                      <HStack justify="space-between" align="start">
                        <VStack spacing={1} align="start" flex={1}>
                          <Text fontSize="xs" color={textColor} fontWeight="medium">
                            Terkumpul
                          </Text>
                          <Text fontSize="lg" fontWeight="bold" color={accentColor}>
                            {formatIDR(totalCollected)}
                          </Text>
                        </VStack>
                        <VStack spacing={1} align="end" flex={1}>
                          <Text fontSize="xs" color={textColor} fontWeight="medium">
                            Target
                          </Text>
                          <Text fontSize="sm" fontWeight="semibold" color={titleColor}>
                            {formatIDR(campaign.target)}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Additional Stats */}
                      <HStack justify="space-between" align="center">
                        <HStack spacing={2}>
                          <FaUsers color={iconColor} />
                          <Text fontSize="sm" color={textColor}>
                            {donorsCount} donatur
                          </Text>
                        </HStack>
                        <Badge
                          colorScheme={progress >= 100 ? 'green' : 'blue'}
                          variant="subtle"
                          borderRadius="full"
                          px={3}
                          py={1}
                        >
                          {progress.toFixed(0)}% tercapai
                        </Badge>
                      </HStack>
                    </VStack>

                    {/* Action Button */}
                    <Link
                      href={`/donasi/${campaign.id}` || '/donasi/wakaf_ats'}
                      passHref
                      legacyBehavior
                    >
                      <Button
                        as="a"
                        size="lg"
                        colorScheme="green"
                        borderRadius="xl"
                        w="100%"
                        fontWeight="bold"
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'lg',
                        }}
                        leftIcon={<FaHeart />}
                      >
                        Donasi Sekarang
                      </Button>
                    </Link>
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>

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
                  Bantuan Anda, sekecil apapun, sangat berarti untuk membantu sesama dan 
                  mewujudkan kebaikan bersama.
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
