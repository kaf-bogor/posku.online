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
import { useEffect, useState } from 'react';
import { FaUsers, FaEnvelopeOpenText, FaRegFileAlt, FaNewspaper, FaCalendarAlt, FaHandsHelping } from 'react-icons/fa';

import { storageUrl } from '~/lib/context/baseUrl';
import EventCard from '~/lib/components/EventCard';
import HeroSection from '~/lib/components/HeroSection';
import NewsCard from '~/lib/components/NewsCard';
import SectionHeader from '~/lib/components/SectionHeader';
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { EventItem } from '~/lib/types/event';
import type { NewsItem } from '~/lib/types/news';

import MainMenus from './components/MainMenus';

const Home = () => {
  const emptyBg = useColorModeValue('gray.50', 'gray.600');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');

  // News data management
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

  // Events data management
  const {
    items: eventItems,
    loading: eventsLoading,
  } = useCrudManager<EventItem>({
    collectionName: 'events',
    blobFolderName: 'events',
    itemSchema: {
      title: '',
      summary: '',
      imageUrls: [],
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      location: '',
      isActive: false,
    },
  });

  // Filter published news and active events
  const publishedNews = newsItems.filter(news => news.isPublished).slice(0, 3);
  const activeEvents = eventItems.filter(event => event.isActive).slice(0, 3);

  const LoadingSection = () => (
    <Center py={8}>
      <Spinner size="md" color="purple.500" />
    </Center>
  );

  const EmptySection = ({ message }: { message: string }) => (
    <Box
      bg={emptyBg}
      borderRadius="xl"
      p={8}
      textAlign="center"
    >
      <Text color={emptyTextColor} fontSize="sm">
        {message}
      </Text>
    </Box>
  );

  return (
    <VStack spacing={8} align="stretch" w="100%">
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Access Menu */}
      <Box>
        <SectionHeader title="Menu Utama" />
        <MainMenus
          items={[
            {
              label: 'Tentang POSKU',
              href: '/tentang',
              imageUrl: `${storageUrl}/logo_posku.png?alt=media`,
            },
            {
              label: 'Muslimah Center',
              href: '/muslimah_center',
              imageUrl: `${storageUrl}/mc_light.png?alt=media`,
            },
            {
              label: 'Pengurus',
              href: '/pengurus',
              icon: FaUsers,
            },
            {
              label: 'Newsletter',
              href: '/newsletter',
              icon: FaEnvelopeOpenText,
            },
            {
              label: 'Laporan',
              href: '/reports',
              icon: FaRegFileAlt,
            },
            {
              label: 'Donasi',
              href: '/donasi',
              icon: FaHandsHelping,
            },
          ]}
        />
      </Box>

      {/* News Section */}
      <Box>
        <SectionHeader
          title="Berita Terbaru"
          icon={FaNewspaper}
          viewAllLink="/news"
          viewAllText="Lihat Semua Berita"
        />
        {newsLoading ? (
          <LoadingSection />
        ) : publishedNews.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {/* Featured news (larger card) */}
            {publishedNews[0] && (
              <NewsCard news={publishedNews[0]} />
            )}
            {/* Compact news cards */}
            {publishedNews.slice(1).map((news) => (
              <NewsCard key={news.id} news={news} isCompact />
            ))}
          </VStack>
        ) : (
          <EmptySection message="Belum ada berita yang dipublikasikan" />
        )}
      </Box>

      {/* Events Section */}
      <Box>
        <SectionHeader 
          title="Acara & Kegiatan" 
          icon={FaCalendarAlt}
          viewAllLink="/admin/events"
          viewAllText="Lihat Semua Acara"
        />
        {eventsLoading ? (
          <LoadingSection />
        ) : activeEvents.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {/* Featured event (larger card) */}
            {activeEvents[0] && (
              <EventCard event={activeEvents[0]} />
            )}
            {/* Compact event cards */}
            {activeEvents.slice(1).map((event) => (
              <EventCard key={event.id} event={event} isCompact />
            ))}
          </VStack>
        ) : (
          <EmptySection message="Belum ada acara yang tersedia" />
        )}
      </Box>

      {/* Additional bottom spacing for bottom navigation */}
      <Box h={{ base: "20px", md: "40px" }} />
    </VStack>
  );
};

export default Home;
