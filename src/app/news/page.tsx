'use client';

import { VStack, SimpleGrid } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaNewspaper } from 'react-icons/fa';

import EmptySection from '../components/EmptySection';
import LoadingSection from '../components/LoadingSection';
import NewsCard from '~/lib/components/NewsCard';
import SectionHeader from '~/lib/components/SectionHeader';
import { listNews } from '~/lib/services/contentService';
import type { NewsItem } from '~/lib/types/news';

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    listNews()
      .then(setNewsItems)
      .finally(() => setNewsLoading(false));
  }, []);

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
