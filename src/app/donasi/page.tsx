'use client';

import { Box, HStack, Image, Heading, Text, Button } from '@chakra-ui/react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

import { firebaseUrl } from '~/lib/context/baseUrl';

const campaign = {
  title: 'Wakaf Gedung Sekolah Kuttab Al Fatih Bogor',
  summary:
    'Bantu wujudkan gedung sekolah Kuttab Al Fatih Bogor. Setiap donasi Anda sangat berarti!',
  media: [
    {
      type: 'image',
      src: `${firebaseUrl}wakaf_ats%2Fgallery_1.png?alt=media`,
      alt: 'Wakaf Gedung Sekolah Kuttab Al Fatih Bogor',
    },
    {
      type: 'video',
      src: 'https://drive.google.com/file/d/1VnuZ8fZfQFJPkm7p7v74pYUOVLfTE3Sq/preview',
      alt: 'Video Wakaf Gedung Sekolah Kuttab Al Fatih Bogor',
    },
  ],
  target: 3100000000,
  donors: 120,
};

const DonasiPage = () => {
  return (
    <Box width="100%" mb={12}>
      <Box as="button" onClick={() => window.history.back()}>
        <HStack my={6}>
          <FaArrowLeft />
          <Text>Kembali</Text>
        </HStack>
      </Box>
      <Box mx="auto" bg="white" borderRadius="lg" boxShadow="md" p={4}>
        <Image
          src={campaign.media[0].src}
          alt={campaign.media[0].alt}
          borderRadius="md"
          objectFit="cover"
          w="full"
          h={['180px', '220px']}
          mb={4}
        />
        <Heading as="h2" size="md" mb={2}>
          {campaign.title}
        </Heading>
        <Text color="gray.700" mb={4}>
          {campaign.summary}
        </Text>
        <Link href="/donasi/wakaf_ats" passHref legacyBehavior>
          <Button colorScheme="green" w="full">
            Donasi Sekarang
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

export default DonasiPage;
