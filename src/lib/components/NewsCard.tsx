import {
  Box,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import Link from 'next/link';

import type { NewsItem } from '~/lib/types/news';

interface NewsCardProps {
  news: NewsItem;
  isCompact?: boolean;
}

const NewsCard = ({ news, isCompact = false }: NewsCardProps) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const titleColor = useColorModeValue('gray.800', 'white');

  return (
    <Link href={`/admin/news/${news.id}`} passHref>
      <Box
        as="a"
        bg={cardBg}
        borderRadius="xl"
        overflow="hidden"
        boxShadow="md"
        transition="all 0.3s ease"
        _hover={{
          boxShadow: 'xl',
          transform: 'translateY(-2px)',
        }}
        cursor="pointer"
        w="100%"
        h={isCompact ? "120px" : "auto"}
      >
        {isCompact ? (
          <HStack spacing={0} h="100%">
            {news.imageUrls[0] && (
              <Image
                src={news.imageUrls[0]}
                alt={news.title}
                w="120px"
                h="100%"
                objectFit="cover"
                flexShrink={0}
              />
            )}
            <VStack align="start" spacing={1} p={3} flex={1} h="100%" justify="space-between">
              <VStack align="start" spacing={1} flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color={titleColor}
                  lineHeight="short"
                  noOfLines={2}
                >
                  {news.title}
                </Text>
                <Text fontSize="xs" color={textColor} noOfLines={2}>
                  {news.summary}
                </Text>
              </VStack>
              <HStack justify="space-between" w="100%" align="center">
                <Text fontSize="xs" color={textColor}>
                  {format(new Date(news.publishDate), 'dd MMM yyyy')}
                </Text>
                {news.isPublished && (
                  <Badge colorScheme="green" size="sm">
                    Published
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
        ) : (
          <VStack spacing={0} align="stretch">
            {news.imageUrls[0] && (
              <Image
                src={news.imageUrls[0]}
                alt={news.title}
                w="100%"
                h="200px"
                objectFit="cover"
              />
            )}
            <VStack align="start" spacing={2} p={4}>
              <Text
                fontSize="lg"
                fontWeight="bold"
                color={titleColor}
                lineHeight="short"
              >
                {news.title}
              </Text>
              <Text fontSize="sm" color={textColor} noOfLines={3}>
                {news.summary}
              </Text>
              <HStack justify="space-between" w="100%" align="center">
                <Text fontSize="sm" color={textColor}>
                  {format(new Date(news.publishDate), 'dd MMMM yyyy')}
                </Text>
                {news.isPublished && (
                  <Badge colorScheme="green">
                    Published
                  </Badge>
                )}
              </HStack>
            </VStack>
          </VStack>
        )}
      </Box>
    </Link>
  );
};

export default NewsCard;
