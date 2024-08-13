'use client';

import { useQuery } from '@apollo/client';
import { Box, HStack, SimpleGrid, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

import Card from '~/lib/components/donasi/Card';
import { GET_PAYMENT_LINK_PAGE_QUERY } from '~/lib/graphql';
import {
  type GetPaymentLinkPageResponse,
  type GetPaymentLinkPageVariables,
} from '~/lib/interfaces/donasi';
import { Error as ErrorView, Empty, Loading } from '~/lib/layout';

const DonasiPage = () => {
  const { data, loading, error, refetch } = useQuery<
    GetPaymentLinkPageResponse,
    GetPaymentLinkPageVariables
  >(GET_PAYMENT_LINK_PAGE_QUERY, {
    variables: {
      username: 'posku',
      pageSize: 9,
      page: 1,
      status: 'active',
      excludeType: 'bundling',
    },
  });

  const payment = data?.getPaymentLinkPageByUsername;

  return (
    <Box width="100%">
      <Link href="/">
        <HStack my={6}>
          <FaArrowLeft />
          <Text>Kembali</Text>
        </HStack>
      </Link>
      {error && (
        <ErrorView error={Error('Something went wrong')} onRetry={refetch} />
      )}
      {loading && <Loading />}
      {!data && !loading && <Empty />}
      {payment && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={10}>
          {payment.items.map((item) => (
            <Card item={item} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default DonasiPage;
