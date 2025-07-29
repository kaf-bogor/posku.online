'use client';

import {
  VStack,
  SimpleGrid,
  Box,
  Text,
  Spinner,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaNewspaper } from 'react-icons/fa';

import NewsCard from '~/lib/components/NewsCard';
import SectionHeader from '~/lib/components/SectionHeader';
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { NewsItem } from '~/lib/types/news';

export default function NewsPage() {
  const emptyBg = useColorModeValue('gray.50', 'gray.600');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');

  const {
    items: newsItems,
    loading: newsLoading,
  } = useCrudManager<NewsItem>({
    collectionName: 'news',
    blobFolderName: 'news',
    itemSchema: {
      title: '',
      summary: '',
      imageUrls: [],
      publishDate: new Date().toISOString(),
      author: '',
      isPublished: false,
    },
  });

  // Filter published news
  const publishedNews = newsItems.filter(news => news.isPublished);

  const LoadingSection = () => (
    <Center py={16}>
      <VStack spacing={4}>
        <Spinner size="xl" color="purple.500" />
        <Text color="purple.500">Memuat berita...</Text>
      </VStack>
    </Center>
  );

  const EmptySection = () => (
    <Box
      bg={emptyBg}
      borderRadius="xl"
      p={12}
      textAlign="center"
    >
      <VStack spacing={4}>
        <FaNewspaper fontSize="48px" color={emptyTextColor} />
        <Text color={emptyTextColor} fontSize="lg" fontWeight="medium">
          Belum ada berita yang dipublikasikan
        </Text>
        <Text color={emptyTextColor} fontSize="sm">
          Berita akan muncul di sini setelah dipublikasikan oleh admin.
        </Text>
      </VStack>
    </Box>
  );

  return (
    <VStack spacing={6} align="stretch" w="100%">
      <SectionHeader title="Semua Berita" icon={FaNewspaper} />
      
      {newsLoading ? (
        <LoadingSection />
      ) : publishedNews.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {publishedNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </SimpleGrid>
      ) : (
        <EmptySection />
      )}
    </VStack>
  );
}
