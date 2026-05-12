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
} from '@chakra-ui/react';
import createDOMPurify from 'dompurify';
import { useRouter } from 'next/navigation';
import { useState, useContext } from 'react';

import Donors from '~/app/reports/wakaf_ats/Donors';
import { AppContext } from '~/lib/context/app';
import type { DonationPage } from '~/lib/types/donation';

function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  return createDOMPurify(window as unknown as Parameters<typeof createDOMPurify>[0]).sanitize(html);
}

export default function DonationDetailClient({
  campaign,
}: {
  campaign: DonationPage;
}) {
  const router = useRouter();
  const { bgColor, textColor } = useContext(AppContext);

  const cardShadow = useColorModeValue('md', 'dark-lg');
  const headingColor = useColorModeValue('gray.800', 'white');
  const buttonBg = useColorModeValue('green.500', 'green.400');
  const buttonText = useColorModeValue('white', 'gray.900');
  const buttonHoverBg = useColorModeValue('green.600', 'green.500');

  const [carouselIdx, setCarouselIdx] = useState(0);

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
    ? { src: campaign.imageUrls[carouselIdx], alt: campaign.title }
    : null;

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
      <VStack
        spacing={4}
        align="stretch"
        bg={bgColor}
        borderRadius="lg"
        boxShadow={cardShadow}
        p={[2, 4]}
      >
        {/* Carousel */}
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

        <Heading as="h1" size="lg" color={headingColor}>
          {campaign.title}
        </Heading>

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
                      __html: sanitizeHtml(campaign.summary),
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
