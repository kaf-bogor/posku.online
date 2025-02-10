import { useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Progress,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';

import { GET_TOTAL_FUND_RAISING_BY_ID } from '~/lib/graphql';
import {
  type GetTotalFundraisingsByIDResponse,
  type GetTotalFundraisingsByIDVariables,
  type Item,
} from '~/lib/interfaces/donasi';
import { Error as ErrorView, Empty, Loading } from '~/lib/layout';

export default function Card({ item }: Props) {
  const { data, loading, error } = useQuery<
    GetTotalFundraisingsByIDResponse,
    GetTotalFundraisingsByIDVariables
  >(GET_TOTAL_FUND_RAISING_BY_ID, {
    variables: {
      link: item.link,
    },
  });

  const target = data?.getTotalFundraisingsByPaymentLinkID?.target ?? 0;
  const totalFundraising =
    data?.getTotalFundraisingsByPaymentLinkID?.totalFundraising ?? 0;
  const percentage = target > 0 ? (totalFundraising / target) * 100 : 0;

  function currency(value: number): string {
    return `Rp. ${value.toLocaleString('id-ID')}`;
  }
  return (
    <Box key={item.id} borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Image
        src={item.coverImage?.url || item.multipleImage?.[0].url}
        alt={item.name}
        width="100%"
        height="200px"
        objectFit="cover"
      />

      <Box p={4}>
        <Stack gap={6} spacing={2}>
          <Heading as="h2" size="md">
            {item.name}
          </Heading>
          {error && <ErrorView error={error} />}
          {loading && <Loading />}
          {!data && !loading && <Empty />}
          {data && (
            <>
              <Progress value={percentage} size="md" />
              <Flex direction="column">
                <Text
                  fontSize="12px"
                  fontWeight="bold"
                >{`Tercapai ${percentage.toFixed(2)}%`}</Text>
                <Text fontSize="12px">{`${currency(totalFundraising)} dari ${currency(target)}`}</Text>
              </Flex>
            </>
          )}
          <Link href={`https://posku.myr.id/donate/${item.link}`}>
            <Button w="full">Lihat</Button>
          </Link>
        </Stack>
      </Box>
    </Box>
  );
}

type Props = {
  item: Item;
};
