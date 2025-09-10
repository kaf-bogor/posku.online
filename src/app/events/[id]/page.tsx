'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Image,
  Button,
  Icon,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { format, isAfter, isBefore, isSameDay } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { doc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

import Summary from '~/app/admin/components/DonationCard/Summary';
import CommentsSection from '~/lib/components/CommentsSection';
import { db } from '~/lib/firebase';
import type { EventItem } from '~/lib/types/event';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const titleColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const dateFormat = 'dd MMMM yyyy';

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  useEffect(() => {
    if (!id) return undefined;

    const ref = doc(db, 'events', id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Omit<EventItem, 'id'>;
        setEvent({ id: snap.id, ...data });
      } else {
        setEvent(null);
      }
      setLoading(false);
    });

    return () => {
      unsub();
    };
  }, [id]);

  const startDate = useMemo(() => {
    return event ? new Date(event.startDate) : new Date();
  }, [event]);
  const endDate = useMemo(() => {
    return event ? new Date(event.endDate) : new Date();
  }, [event]);

  const status = useMemo(() => {
    const now = new Date();
    if (!event) return { label: '', colorScheme: 'gray' as const };
    if (isBefore(now, startDate))
      return { label: 'Upcoming', colorScheme: 'blue' as const };
    if (isAfter(now, endDate))
      return { label: 'Ended', colorScheme: 'gray' as const };
    return { label: 'Ongoing', colorScheme: 'green' as const };
  }, [event, startDate, endDate]);

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner />
      </Box>
    );
  }

  if (!event) {
    return (
      <VStack spacing={4} align="center" p={8}>
        <Heading size="md">Acara tidak ditemukan</Heading>
        <Button onClick={() => router.push('/events')}>
          Kembali ke Daftar
        </Button>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch" w="100%" p={0}>
      <Link href="/events" passHref>
        <Button as="a" variant="ghost" alignSelf="start">
          Kembali ke semua acara
        </Button>
      </Link>
      <HStack justify="space-between" align="center">
        <Heading size="lg" color={titleColor}>
          {event.title}
        </Heading>
        <HStack>
          <Badge colorScheme={status.colorScheme}>{status.label}</Badge>
          {event.isActive && <Badge colorScheme="purple">Active</Badge>}
        </HStack>
      </HStack>

      {event.imageUrls?.[0] && (
        <Box
          bg={cardBg}
          borderRadius="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
          position="relative"
          _hover={{ '& .image-indicator': { opacity: 1 } }}
        >
          <Image
            src={event.imageUrls[0]}
            alt={event.title}
            w="100%"
            h={isImageExpanded ? 'auto' : { base: '220px', md: '320px' }}
            objectFit={isImageExpanded ? 'contain' : 'cover'}
            cursor="pointer"
            onClick={() => setIsImageExpanded(!isImageExpanded)}
            transition="all 0.3s ease"
          />
          <Box
            className="image-indicator"
            position="absolute"
            bottom="2"
            right="2"
            bg="blackAlpha.700"
            color="white"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="xs"
            opacity={0}
            transition="opacity 0.2s ease"
            pointerEvents="none"
          >
            {isImageExpanded ? 'Klik untuk perkecil' : 'Klik untuk perbesar'}
          </Box>
        </Box>
      )}

      <Box
        bg={cardBg}
        borderRadius="xl"
        p={4}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack align="start" spacing={3}>
          <HStack spacing={3} color={textColor} fontSize="sm">
            <Icon as={FaCalendarAlt} />
            <Text>
              {isSameDay(startDate, endDate)
                ? format(startDate, dateFormat, { locale: localeID })
                : `${format(startDate, dateFormat, { locale: localeID })} - ${format(endDate, dateFormat, { locale: localeID })}`}
            </Text>
          </HStack>
          <HStack spacing={3} color={textColor} fontSize="sm">
            <Icon as={FaMapMarkerAlt} />
            <Text>{event.location}</Text>
          </HStack>
          <Box color={textColor}>
            <Summary summary={event.summary} isDefaultExpanded />
          </Box>
        </VStack>
      </Box>

      {event.imageUrls?.length > 1 && (
        <VStack align="stretch" spacing={3}>
          <Heading size="sm">Galeri</Heading>
          <HStack spacing={3} overflowX="auto">
            {event.imageUrls.slice(1).map((url) => (
              <Image
                key={url}
                src={url}
                alt={event.title}
                h="120px"
                objectFit="cover"
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              />
            ))}
          </HStack>
        </VStack>
      )}

      {/* Comments Section */}
      <Box>
        <CommentsSection resourceType="events" resourceId={id} />
      </Box>
    </VStack>
  );
}
