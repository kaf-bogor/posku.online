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
import { FaCalendarAlt } from 'react-icons/fa';

import EventCard from '~/lib/components/EventCard';
import SectionHeader from '~/lib/components/SectionHeader';
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { EventItem } from '~/lib/types/event';

export default function EventsPage() {
  const emptyBg = useColorModeValue('gray.50', 'gray.600');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');

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

  // Filter active events
  const activeEvents = eventItems.filter(event => event.isActive);

  const LoadingSection = () => (
    <Center py={16}>
      <VStack spacing={4}>
        <Spinner size="xl" color="purple.500" />
        <Text color="purple.500">Memuat acara...</Text>
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
        <FaCalendarAlt fontSize="48px" color={emptyTextColor} />
        <Text color={emptyTextColor} fontSize="lg" fontWeight="medium">
          Belum ada acara yang tersedia
        </Text>
        <Text color={emptyTextColor} fontSize="sm">
          Acara dan kegiatan akan muncul di sini setelah dibuat oleh admin.
        </Text>
      </VStack>
    </Box>
  );

  return (
    <VStack spacing={6} align="stretch" w="100%">
      <SectionHeader title="Semua Acara & Kegiatan" icon={FaCalendarAlt} />
      
      {eventsLoading ? (
        <LoadingSection />
      ) : activeEvents.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {activeEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </SimpleGrid>
      ) : (
        <EmptySection />
      )}
    </VStack>
  );
}
