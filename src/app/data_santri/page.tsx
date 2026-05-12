'use client';

import { Box, Heading, Link, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useContext } from 'react';

import { AppContext } from '~/lib/context/app';

const TAHUN_AJARAN = [
  {
    label: 'Tahun Ajaran 2025 / 2026',
    href: '/data_santri/ta_2025_2026',
    description: 'Pembagian kelas, pengajar, dan daftar santri TA 2025/2026',
  },
];

export default function DataSantriPage() {
  const { bgColor, borderColor } = useContext(AppContext);
  const cardShadow = useColorModeValue('md', 'dark-lg');
  const headingColor = useColorModeValue('gray.900', 'white');
  const subHeadingColor = useColorModeValue('gray.600', 'gray.400');
  const cardHoverBg = useColorModeValue('blue.50', 'blue.900');
  const labelColor = useColorModeValue('blue.700', 'blue.300');

  return (
    <Box maxW="2xl" mx="auto" px={{ base: 4, sm: 6 }} py={{ base: 6, sm: 10 }}>
      <VStack align="flex-start" spacing={1} mb={8}>
        <Heading size="xl" fontWeight="extrabold" color={headingColor}>
          Data Santri
        </Heading>
        <Text color={subHeadingColor} fontSize="lg">
          Kuttab Al-Fatih Bogor — pilih tahun ajaran
        </Text>
      </VStack>

      <VStack spacing={4} align="stretch">
        {TAHUN_AJARAN.map((ta) => (
          <Link
            key={ta.href}
            as={NextLink}
            href={ta.href}
            _hover={{ textDecoration: 'none' }}
          >
            <Box
              bg={bgColor}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              boxShadow={cardShadow}
              px={6}
              py={5}
              cursor="pointer"
              transition="all 0.15s ease"
              _hover={{ bg: cardHoverBg, transform: 'translateY(-2px)', boxShadow: 'lg' }}
            >
              <Text fontWeight="bold" fontSize="lg" color={labelColor}>
                {ta.label}
              </Text>
              <Text fontSize="sm" color={subHeadingColor} mt={1}>
                {ta.description}
              </Text>
            </Box>
          </Link>
        ))}
      </VStack>
    </Box>
  );
}
