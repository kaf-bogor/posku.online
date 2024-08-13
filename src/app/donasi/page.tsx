'use client';

import { useQuery } from '@apollo/client';
import {
  Box,
  Image,
  HStack,
  Stack,
  Heading,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

import { GET_PAYMENT_LINK_PAGE_QUERY } from '~/lib/graphql';

const DonasiPage = () => {
  const { data, loading, error } = useQuery(GET_PAYMENT_LINK_PAGE_QUERY, {
    variables: {
      username: 'posku',
      pageSize: 9,
      page: 1,
      status: 'active',
      excludeType: 'bundling',
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return <p>No data available</p>;

  const { items } = data.getPaymentLinkPageByUsername;

  return (
    <Box>
      <Link href="/">
        <HStack my={6}>
          <FaArrowLeft />
          <Text>Kembali</Text>
        </HStack>
      </Link>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={10}>
        {items.map((item) => (
          <Box
            key={item.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
          >
            <Image
              src={item.coverImage?.url}
              alt={item.name}
              width="100%"
              height="200px"
              objectFit="cover"
            />

            <Box p={4}>
              <Stack spacing={2}>
                <Heading as="h2" size="md">
                  {item.name}
                </Heading>
                <Text>Amount: {item.amount}</Text>
                <Link href={`donasi/${item.link}`}>View Link</Link>
              </Stack>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default DonasiPage;
