import { useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Progress,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FaUsers, FaHeart } from 'react-icons/fa';

import { GET_TOTAL_FUND_RAISING_BY_ID } from '~/lib/graphql';
import {
  type GetTotalFundraisingsByIDResponse,
  type GetTotalFundraisingsByIDVariables,
  type Item,
} from '~/lib/interfaces/donasi';
import { Error as ErrorView, Empty, Loading } from '~/lib/layout';
import { formatIDR } from '~/lib/utils/currency';

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

  // Color theme
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const titleColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('green.500', 'green.400');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const progressBg = useColorModeValue('gray.100', 'gray.600');

  return (
    <Box
      key={item.id}
      bg={cardBg}
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="lg"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '2xl',
      }}
      border="1px solid"
      borderColor={borderColor}
    >
      {/* Image Section */}
      <Box position="relative" overflow="hidden">
        <Image
          src={item.coverImage?.url || item.multipleImage?.[0].url}
          alt={item.name}
          width="100%"
          height="200px"
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
          <Icon as={FaHeart} color="red.500" />
        </Box>
      </Box>

      {/* Content Section */}
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
          {item.name}
        </Heading>

        {/* Loading/Error States */}
        {error && <ErrorView error={error} />}
        {loading && <Loading />}
        {!data && !loading && <Empty />}

        {/* Progress and Stats */}
        {data && (
          <VStack spacing={3} align="stretch">
            {/* Progress Bar */}
            <Progress
              value={percentage}
              colorScheme="green"
              size="lg"
              borderRadius="full"
              bg={progressBg}
            />

            {/* Stats */}
            <HStack justify="space-between" align="start">
              <VStack spacing={1} align="start" flex={1}>
                <Text fontSize="xs" color={textColor} fontWeight="medium">
                  Terkumpul
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={accentColor}>
                  {formatIDR(totalFundraising)}
                </Text>
              </VStack>
              <VStack spacing={1} align="end" flex={1}>
                <Text fontSize="xs" color={textColor} fontWeight="medium">
                  Target
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color={titleColor}>
                  {formatIDR(target)}
                </Text>
              </VStack>
            </HStack>

            {/* Progress Badge */}
            <Flex justify="center">
              <Badge
                colorScheme={percentage >= 100 ? 'green' : 'blue'}
                variant="subtle"
                borderRadius="full"
                px={4}
                py={2}
                fontSize="sm"
              >
                {percentage.toFixed(1)}% tercapai
              </Badge>
            </Flex>
          </VStack>
        )}

        {/* Action Button */}
        <Link href={`https://posku.myr.id/donate/${item.link}`}>
          <Button
            w="full"
            size="lg"
            colorScheme="green"
            borderRadius="xl"
            fontWeight="bold"
            leftIcon={<FaHeart />}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
          >
            Donasi Sekarang
          </Button>
        </Link>
      </VStack>
    </Box>
  );
}

type Props = {
  item: Item;
};
