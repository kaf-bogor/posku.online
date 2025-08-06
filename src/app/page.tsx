'use client';

import {
  VStack,
  Box,
  Text,
  Spinner,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaUsers,
  FaEnvelopeOpenText,
  FaRegFileAlt,
  FaNewspaper,
  FaCalendarAlt,
  FaHandsHelping,
} from 'react-icons/fa';

import EventCard from '~/lib/components/EventCard';
import HeroSection from '~/lib/components/HeroSection';
import NewsCard from '~/lib/components/NewsCard';
import SectionHeader from '~/lib/components/SectionHeader';
import { storageUrl } from '~/lib/context/baseUrl';
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { EventItem } from '~/lib/types/event';
import type { NewsItem } from '~/lib/types/news';

import MainMenus from './components/MainMenus';

const LoadingSection = () => (
  <Center py={8}>
    <Spinner size="md" color="purple.500" />
  </Center>
);

const EmptySection = ({ message }: { message: string }) => {
  const emptyBg = useColorModeValue('gray.50', 'gray.600');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box bg={emptyBg} borderRadius="xl" p={8} textAlign="center">
      <Text color={emptyTextColor} fontSize="sm">
        {message}
      </Text>
    </Box>
  );
};

const NewsSection = ({
  newsItems,
  loading,
}: {
  newsItems: NewsItem[];
  loading: boolean;
}) => {
  const publishedNews = newsItems
    .filter((news) => news.isPublished)
    .slice(0, 3);

  return (
    <Box>
      <SectionHeader
        title="Berita Terbaru"
        icon={FaNewspaper}
        viewAllLink="/news"
        viewAllText="Lihat Semua Berita"
      />
      {/* Conditional rendering without nested ternaries */}
      {(() => {
        if (loading) {
          return <LoadingSection />;
        }
        if (publishedNews.length > 0) {
          return (
            <VStack spacing={4} align="stretch">
              {publishedNews[0] && <NewsCard news={publishedNews[0]} />}
              {publishedNews.slice(1).map((news) => (
                <NewsCard key={news.id} news={news} isCompact />
              ))}
            </VStack>
          );
        }
        return <EmptySection message="Belum ada berita yang dipublikasikan" />;
      })()}
    </Box>
  );
};

const EventsSection = ({
  eventItems,
  loading,
}: {
  eventItems: EventItem[];
  loading: boolean;
}) => {
  const activeEvents = eventItems.filter((event) => event.isActive).slice(0, 3);

  return (
    <Box>
      <SectionHeader
        title="Acara & Kegiatan"
        icon={FaCalendarAlt}
        viewAllLink="/events"
        viewAllText="Lihat Semua Acara"
      />
      {/* Conditional rendering without nested ternaries */}
      {(() => {
        if (loading) {
          return <LoadingSection />;
        }
        if (activeEvents.length > 0) {
          return (
            <VStack spacing={4} align="stretch">
              {activeEvents[0] && <EventCard event={activeEvents[0]} />}
              {activeEvents.slice(1).map((event) => (
                <EventCard key={event.id} event={event} isCompact />
              ))}
            </VStack>
          );
        }
        return <EmptySection message="Belum ada acara yang tersedia" />;
      })()}
    </Box>
  );
};

const Home = () => {
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

  const { items: eventItems, loading: eventsLoading } =
    useCrudManager<EventItem>({
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

  return (
    <VStack spacing={6} align="stretch" w="100%">
      <HeroSection />

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

      <NewsSection newsItems={newsItems} loading={newsLoading} />
      <EventsSection eventItems={eventItems} loading={eventsLoading} />

      <Box h={{ base: '20px', md: '40px' }} />
    </VStack>
  );
};

export default Home;
