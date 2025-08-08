'use client';

import { Heading, VStack, SimpleGrid, Text } from '@chakra-ui/react';
import { useContext } from 'react';

import ContentWrapper from '~/app/components/ContentWrapper';
import EmptySection from '~/app/components/EmptySection';
import LoadingSection from '~/app/components/LoadingSection';
import EventCard from '~/lib/components/EventCard';
import { AppContext } from '~/lib/context/app';
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { EventItem } from '~/lib/types/event';

export default function EventsPage() {
  const { textColor } = useContext(AppContext);
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
    <ContentWrapper withBg={false} withPadding={false}>
      <VStack spacing={4} textAlign="center" mb={6}>
        <Heading size="2xl" color={textColor} fontWeight="bold">
          Acara & Kegiatan
        </Heading>
        <Text fontSize="lg" color={textColor} maxW="600px" lineHeight="relaxed">
          Event dan kegiatan yang akan datang di Kuttab Al-Fatih.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {activeEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </SimpleGrid>
      </VStack>
    </ContentWrapper>
  );
}
