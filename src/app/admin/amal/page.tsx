'use client';

import { Button, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

import DonationCard from '../components/DonationCard';
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { DonationPage } from '~/lib/types/donation';
import { initialDonationState } from '~/lib/types/donation';

const DonationsPage = () => {
  const router = useRouter();

  const { items: donations } = useCrudManager<DonationPage>({
    collectionName: 'donations',
    blobFolderName: 'donation',
    itemSchema: initialDonationState,
  });

  return (
    <VStack align="stretch" spacing={4}>
      <Button
        alignSelf="start"
        colorScheme="green"
        onClick={() => router.push('/admin/amal/add')}
      >
        Tambah Amal
      </Button>

      <VStack gap="16px">
        {donations.map((d) => (
          <DonationCard
            key={d.id}
            donation={d}
            onEdit={() => router.push(`/admin/amal/${d.id}/edit`)}
          />
        ))}
      </VStack>
    </VStack>
  );
};

export default DonationsPage;
