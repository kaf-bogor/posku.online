import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link'; // Import the Link component

import BackButton from '~/app/components/BackButton';

const menuItems = [
  {
    title: 'Laporan Wakaf ATS (deprecated: last update was 2025-06-27)',
    link: '/reports/wakaf_ats',
    description: null,
  },
  {
    title: 'Laporan beasiswa 2024-2025 (dummy)',
    link: '/reports/beasiswa-2024.html',
    description: null,
  },
];

export default function HomePage() {
  return (
    <>
      <Box w="full" textAlign="left" mb={2}>
        <BackButton />
      </Box>
      <Heading as="h1" mb={6} size="xl" textAlign="center">
        Laporan seputar kuttab
      </Heading>

      <VStack spacing={4} align="stretch">
        {menuItems.map((item) => (
          <Link href={item.link} passHref>
            <Box
              bg="white"
              key={item.title}
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius="md"
              _hover={{ bg: 'gray.50' }}
            >
              <Heading as="a" fontSize="xl" color="gray.900">
                {item.title}
              </Heading>
              {item?.description && (
                <Text mt={2} color="gray.600">
                  {item.description}
                </Text>
              )}
            </Box>
          </Link>
        ))}
      </VStack>
    </>
  );
}
