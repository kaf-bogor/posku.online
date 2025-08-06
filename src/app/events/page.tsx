'use client';

import { VStack, SimpleGrid } from '@chakra-ui/react';
import { FaCalendarAlt } from 'react-icons/fa';

import EmptySection from '~/app/components/EmptySection';
import LoadingSection from '~/app/components/LoadingSection';
import EventCard from '~/lib/components/EventCard';
import SectionHeader from '~/lib/components/SectionHeader';
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { EventItem } from '~/lib/types/event';

export default function EventsPage() {
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

  const activeEvents = eventItems.filter((event) => event.isActive);

  if (eventsLoading) {
    return <LoadingSection resourceName="Acara & Kegiatan" />;
  }

  if (activeEvents.length < 1) {
    return <EmptySection resourceName="Acara & Kegiatan" />;
  }

  return (
    <VStack spacing={6} align="stretch" w="100%">
      <SectionHeader title="Semua Acara & Kegiatan" icon={FaCalendarAlt} />
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {activeEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </SimpleGrid>
    </VStack>
  );
}
