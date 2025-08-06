'use client';

import { VStack, SimpleGrid } from '@chakra-ui/react';
import { FaNewspaper } from 'react-icons/fa';

import EmptySection from '../components/EmptySection';
import LoadingSection from '../components/LoadingSection';
import NewsCard from '~/lib/components/NewsCard';
import SectionHeader from '~/lib/components/SectionHeader';
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { NewsItem } from '~/lib/types/news';

export default function NewsPage() {
  const { items: newsItems, loading: newsLoading } = useCrudManager<NewsItem>({
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
  const publishedNews = newsItems.filter((news) => news.isPublished);

  if (newsLoading) {
    return <LoadingSection resourceName="berita" />;
  }

  if (publishedNews.length < 1) {
    return <EmptySection resourceName="berita" />;
  }

  return (
    <VStack spacing={6} align="stretch" w="100%">
      <SectionHeader title="Semua Acara & Kegiatan" icon={FaNewspaper} />
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {publishedNews.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </SimpleGrid>
    </VStack>
  );
}
