'use client';

import {
  VStack,
  Box,
  Text,
  Spinner,
  Center,
  useColorModeValue,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import Link from 'next/link';
import { useContext } from 'react';
import {
  FaUsers,
  FaEnvelopeOpenText,
  FaRegFileAlt,
  FaNewspaper,
  FaCalendarAlt,
  FaHandsHelping,
} from 'react-icons/fa';

import HeroSection from '~/lib/components/HeroSection';
import SectionHeader from '~/lib/components/SectionHeader';
import { AppContext } from '~/lib/context/app';
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
  const { bgColor } = useContext(AppContext);
  const publishedNews = newsItems
    .filter((news) => news.isPublished)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    )
    .slice(0, 3);
  const dateColor = useColorModeValue('gray.600', 'gray.300');

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
            <VStack>
              {publishedNews.map((news) => (
                <Link
                  href={`/news/${news.id}`}
                  key={news.id}
                  style={{ width: '100%' }}
                >
                  <Flex
                    bg={bgColor}
                    p={2}
                    rounded="xl"
                    alignItems="center"
                    boxShadow="md"
                  >
                    <Icon as={FaNewspaper} boxSize={3.5} mr={2} />
                    <Text as="span" color={dateColor} mr={2}>
                      {format(new Date(news.publishDate), 'dd MMMM yyyy', {
                        locale: localeID,
                      })}
                      :
                    </Text>
                    {news.title}
                  </Flex>
                </Link>
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
  const { bgColor } = useContext(AppContext);
  const activeEvents = eventItems
    .filter((event) => event.isActive)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
    .slice(0, 3);
  const dateColor = useColorModeValue('gray.600', 'gray.300');
  const pastEventTextColor = useColorModeValue('gray.400', 'gray.500');
  const activeEventTextColor = useColorModeValue('gray.800', 'white');

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
            <VStack>
              {activeEvents.map((event) => {
                const isEventPast = new Date(event.endDate) < new Date();
                const eventTextColor = isEventPast
                  ? pastEventTextColor
                  : activeEventTextColor;

                return (
                  <Link
                    href={`/events/${event.id}`}
                    key={event.id}
                    style={{ width: '100%' }}
                  >
                    <Flex
                      bg={bgColor}
                      p={2}
                      rounded="xl"
                      alignItems="center"
                      boxShadow="md"
                      color={eventTextColor}
                    >
                      <Icon as={FaCalendarAlt} boxSize={3.5} mr={2} />
                      <Text as="span" color={dateColor} mr={2}>
                        {format(new Date(event.startDate), 'dd MMMM yyyy', {
                          locale: localeID,
                        })}
                        :
                      </Text>
                      {event.title}
                    </Flex>
                  </Link>
                );
              })}
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
              label: 'Amal',
              href: '/amal',
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
