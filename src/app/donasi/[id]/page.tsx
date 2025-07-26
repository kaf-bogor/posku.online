'use client';

import {
  Box,
  VStack,
  HStack,
  Stack,
  Image,
  Heading,
  Text,
  Progress,
  Button,
  Avatar,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react';
import DOMPurify from 'dompurify';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useContext } from 'react';

import Donors from '~/app/reports/wakaf_ats/Donors';
import { AppContext } from '~/lib/context/app';
import { db } from '~/lib/firebase';
import type { DonationPage } from '~/lib/types/donation';

export default function DonationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<DonationPage | null>(null);
  const [loading, setLoading] = useState(true);

  const { bgColor, textColor } = useContext(AppContext);

  // Color tokens
  const cardShadow = useColorModeValue('md', 'dark-lg');
  const headingColor = useColorModeValue('gray.800', 'white');
  const buttonBg = useColorModeValue('green.500', 'green.400');
  const buttonText = useColorModeValue('white', 'gray.900');
  const buttonHoverBg = useColorModeValue('green.600', 'green.500');

  // Carousel state
  const [carouselIdx, setCarouselIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchCampaign = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'donations', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCampaign({ id: docSnap.id, ...docSnap.data() } as DonationPage);
        } else {
          setCampaign(null);
        }
      } catch {
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!campaign) {
    return (
      <Center minH="60vh">
        <Text>Donasi tidak ditemukan.</Text>
        <Button mt={4} onClick={() => router.back()}>
          Kembali
        </Button>
      </Center>
    );
  }

  // Carousel logic
  const totalMedia = campaign.imageUrls?.length || 0;
  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIdx((prev) => (prev - 1 + totalMedia) % totalMedia);
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIdx((prev) => (prev + 1) % totalMedia);
  };
  const currentMedia = campaign.imageUrls?.[carouselIdx]
    ? {
        type: 'image',
        src: campaign.imageUrls[carouselIdx],
        alt: campaign.title,
      }
    : null;

  // Placeholder for raised, target, donors, organizer
  const raised = (campaign.donors || []).reduce((sum, d) => sum + d.value, 0);
  const target = campaign.target || 0;
  const donorsCount =
    campaign.donors?.reduce(
      (acc, donor) => acc + (Number(donor.donorsCount) || 1),
      0
    ) || 0;
  const percent = target
    ? Math.min(100, Math.round((raised / target) * 100))
    : 0;

  return (
    <Box mx="auto" px={2} py={4} mb={10}>
      {/* Hero Section */}
      <VStack
        spacing={4}
        align="stretch"
        bg={bgColor}
        borderRadius="lg"
        boxShadow={cardShadow}
        p={[2, 4]}
      >
        {/* Carousel Start */}
        <Box position="relative" w="full" h={['180px', '260px']}>
          {currentMedia ? (
            <Image
              src={currentMedia.src}
              alt={currentMedia.alt}
              borderRadius="md"
              objectFit="cover"
              w="full"
              h={['180px', '260px']}
            />
          ) : (
            <Box
              w="full"
              h={['180px', '260px']}
              borderRadius="md"
              overflow="hidden"
              bg="gray.200"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="gray.500">Tidak ada gambar</Text>
            </Box>
          )}
          {/* Carousel Arrows */}
          {totalMedia > 1 && (
            <>
              <Button
                position="absolute"
                top="50%"
                left={2}
                transform="translateY(-50%)"
                size="sm"
                onClick={goPrev}
                zIndex={2}
                bg="whiteAlpha.800"
                _hover={{ bg: 'white' }}
                borderRadius="full"
                minW={0}
                px={2}
              >
                &#8592;
              </Button>
              <Button
                position="absolute"
                top="50%"
                right={2}
                transform="translateY(-50%)"
                size="sm"
                onClick={goNext}
                zIndex={2}
                bg="whiteAlpha.800"
                _hover={{ bg: 'white' }}
                borderRadius="full"
                minW={0}
                px={2}
              >
                &#8594;
              </Button>
            </>
          )}
          {/* Dots */}
          <HStack
            position="absolute"
            bottom={2}
            left="50%"
            transform="translateX(-50%)"
            spacing={1}
            zIndex={2}
          >
            {campaign.imageUrls?.map((img, idx) => (
              <Box
                key={img || idx}
                w={2}
                h={2}
                borderRadius="full"
                bg={idx === carouselIdx ? 'green.500' : 'gray.300'}
                cursor="pointer"
                border={idx === carouselIdx ? '2px solid white' : 'none'}
                onClick={() => setCarouselIdx(idx)}
              />
            ))}
          </HStack>
        </Box>
        {/* Carousel End */}
        <Heading as="h1" size="lg" color={headingColor}>
          {campaign.title}
        </Heading>
        {/* Progress Bar */}
        <Box>
          <HStack justify="space-between">
            <Text fontWeight="bold">Rp{raised.toLocaleString('id-ID')}</Text>
            <Text fontSize="sm" color="gray.500">
              dari Rp{target.toLocaleString('id-ID')}
            </Text>
          </HStack>
          <Progress
            colorScheme="green"
            value={percent}
            borderRadius="md"
            mt={1}
          />
          <Text fontSize="xs" color="green.600" mt={1}>
            {percent}% tercapai • {donorsCount} Donatur
          </Text>
        </Box>
        {/* Donation Input */}
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={2}
          align="stretch"
          w="full"
        >
          <Button
            colorScheme="green"
            onClick={() => router.push(campaign.link)}
            flex={1}
            bg={buttonBg}
            color={buttonText}
            _hover={{ bg: buttonHoverBg }}
            p={[2, 0]}
            my={[2, 0]}
          >
            Donasi Sekarang
          </Button>
        </Stack>
      </VStack>

      {/* Campaign Description with Tabs */}
      <Box mt={8} bg={bgColor} borderRadius="lg" boxShadow="sm" p={[2, 4]}>
        <Tabs variant="enclosed" colorScheme="green">
          <TabList>
            <Tab fontWeight="bold" color={textColor}>
              Tentang
            </Tab>
            <Tab fontWeight="bold" color={textColor}>
              Laporan
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box mb={4} color={textColor}>
                {campaign.summary ? (
                  <Box
                    as="div"
                    fontSize="md"
                    color={textColor}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(campaign.summary),
                    }}
                  />
                ) : (
                  <Text>Tidak ada ringkasan.</Text>
                )}
              </Box>
            </TabPanel>
            <TabPanel>
              <Donors donors={campaign.donors || []} withHeading={false} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Organizer Info */}
      <Box
        mt={6}
        bg={bgColor}
        borderRadius="lg"
        boxShadow="sm"
        p={[2, 4]}
        color={textColor}
      >
        <Heading as="h3" size="sm" mb={2}>
          Penanggung Jawab
        </Heading>
        <HStack>
          <Avatar
            src={campaign.organizer.avatar}
            name={campaign.organizer.name}
          />
          <Box>
            <Text fontWeight="bold">{campaign.organizer.name}</Text>
            <Text fontSize="sm">{campaign.organizer.tagline}</Text>
          </Box>
        </HStack>
      </Box>
    </Box>
  );
}
