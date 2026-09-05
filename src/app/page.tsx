'use client';

import {
  VStack,
  HStack,
  Box,
  Text,
  Spinner,
  Center,
  useColorModeValue,
  Flex,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import Link from 'next/link';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
  FaUsers,
  FaEnvelopeOpenText,
  FaNewspaper,
  FaCalendarAlt,
  FaHourglassHalf,
  FaCalendarCheck,
  FaUserCheck,
} from 'react-icons/fa';
import { FiHelpCircle } from 'react-icons/fi';

import HeroSection from '~/lib/components/HeroSection';
import SectionHeader from '~/lib/components/SectionHeader';
import { AppContext } from '~/lib/context/app';
import { storageUrl } from '~/lib/context/baseUrl';
import rawKalender from '~/lib/data/kalender_posku.json';
import { listEvents, listNews } from '~/lib/services/contentService';
import type { EventItem } from '~/lib/types/event';
import type { NewsItem } from '~/lib/types/news';
import type {
  KalenderData,
  KalenderEvent,
  KalenderOngoing,
} from '~/lib/utils/kalender';
import {
  KATEGORI_COLOR,
  KATEGORI_LABEL,
  formatRentang,
  upcomingEvents,
} from '~/lib/utils/kalender';

import MainMenus from './components/MainMenus';

const KalenderSection = ({
  upcoming,
  ongoing,
}: {
  upcoming: KalenderEvent[];
  ongoing: KalenderOngoing[];
}) => {
  const { bgColor } = useContext(AppContext);
  const dateColor = useColorModeValue('gray.600', 'gray.300');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const alwaysOn = ongoing.filter((o) =>
    /menyusul|belum ditentukan|insidental/i.test(o.cadence)
  );
  const othersOngoing = ongoing.filter(
    (o) => !/menyusul|belum ditentukan|insidental/i.test(o.cadence)
  );
  const displayOnGoing = [...alwaysOn, ...othersOngoing];

  return (
    <Box>
      <SectionHeader
        title="Kalender POSKU"
        icon={FaCalendarAlt}
        viewAllLink="/kalender_posku"
        viewAllText="Lihat Semua Kegiatan"
      />

      {/* 4 kegiatan akan datang — dalam satu baris */}
      <Box overflowX="auto" pb={1}>
        {upcoming.length === 0 && displayOnGoing.length === 0 && (
          <Text color={mutedColor} fontSize="sm">
            Belum ada kegiatan.
          </Text>
        )}
        <HStack spacing={3} align="stretch" minW="max-content">
          {upcoming.map((ev) => (
            <Flex
              key={`${ev.name}-${ev.start}`}
              bg={bgColor}
              w={{ base: '200px', md: '220px' }}
              flexShrink={0}
              p={3}
              flexDir="column"
              rounded="xl"
              boxShadow="md"
              border="1px solid"
              borderColor={borderColor}
            >
              <HStack spacing={1.5} mb={2}>
                <Box
                  color={
                    KATEGORI_COLOR[ev.category] === 'purple'
                      ? 'purple.400'
                      : 'blue.400'
                  }
                >
                  <FaCalendarCheck size={13} />
                </Box>
                <Badge
                  colorScheme={KATEGORI_COLOR[ev.category]}
                  variant="subtle"
                  fontSize="10px"
                >
                  {KATEGORI_LABEL[ev.category]}
                </Badge>
              </HStack>
              <Text fontSize="sm" fontWeight="semibold" noOfLines={2} flex={1}>
                {ev.name}
              </Text>
              <Text fontSize="xs" color={mutedColor} mt={1} noOfLines={1}>
                {formatRentang(ev)}
              </Text>
            </Flex>
          ))}
        </HStack>
      </Box>

      {/* Kegiatan berjalan / belum berjadwal — selalu tampil */}
      {displayOnGoing.length > 0 && (
        <VStack spacing={2} align="stretch" mt={3}>
          {displayOnGoing.map((o) => (
            <Flex
              key={o.name}
              bg={bgColor}
              p={2.5}
              rounded="xl"
              alignItems="center"
              boxShadow="md"
              border="1px solid"
              borderColor={borderColor}
              borderLeft="4px solid"
              borderLeftColor="teal.400"
            >
              <Box mr={3} color="teal.500">
                <FaHourglassHalf size={14} />
              </Box>
              <Box flex={1} minW={0}>
                <Text
                  as="span"
                  fontSize="sm"
                  fontWeight="semibold"
                  noOfLines={1}
                >
                  {o.name}
                </Text>
                <Text as="div" fontSize="xs" color={mutedColor} noOfLines={1}>
                  {o.cadence}
                </Text>
              </Box>
              <Badge
                colorScheme="teal"
                variant="subtle"
                fontSize="10px"
                ml={2}
                flexShrink={0}
              >
                Berjalan
              </Badge>
            </Flex>
          ))}
        </VStack>
      )}
      <Text fontSize="xs" color={dateColor} mt={3}>
        Sumber: kalender program POSKU tahun ajaran 2026/2027
      </Text>
    </Box>
  );
};

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
    .slice(0, 10);
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
                  href={`/news/${news.slug}`}
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
    .slice(0, 10);
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
                    href={`/events/${event.slug}`}
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
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [eventItems, setEventItems] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    listNews()
      .then(setNewsItems)
      .finally(() => setNewsLoading(false));
    listEvents()
      .then(setEventItems)
      .finally(() => setEventsLoading(false));
  }, []);

  const kalender = useMemo(() => {
    const data = rawKalender as KalenderData;
    const today = new Date();
    const upcoming = upcomingEvents(data.events, today, 4);
    return { data, upcoming };
  }, []);

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
              imageUrl: `${storageUrl}/logo_posku.png`,
            },
            {
              label: 'Muslimah Center',
              href: '/muslimah_center',
              imageUrl: `${storageUrl}/mc_light.png`,
            },
            {
              label: 'Pengurus',
              href: '/pengurus',
              icon: FaUsers,
            },
            {
              label: 'Kalender POSKU',
              href: '/kalender_posku',
              icon: FaCalendarAlt,
            },
            {
              label: 'Newsletter',
              href: '/newsletter',
              icon: FaEnvelopeOpenText,
            },
            {
              label: 'Quiz',
              href: '/quiz',
              icon: FiHelpCircle,
            },
            {
              label: 'Kehadiran',
              href: '/kehadiran',
              icon: FaUserCheck,
            },
          ]}
        />
      </Box>

      <NewsSection newsItems={newsItems} loading={newsLoading} />
      <EventsSection eventItems={eventItems} loading={eventsLoading} />

      {/* Kalender POSKU — diletakkan di bagian paling bawah */}
      <KalenderSection
        upcoming={kalender.upcoming}
        ongoing={kalender.data.ongoing_programs}
      />

      <Box h={{ base: '20px', md: '40px' }} />
    </VStack>
  );
};

export default Home;
