'use client';

import { Box, SimpleGrid } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

import DonationCard from '../components/DonationCard';
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { DonationPage } from '~/lib/types/donation';
import { initialDonationState } from '~/lib/types/donation';

const DonationsPage = () => {
  const router = useRouter();

  const { items: donations, handleDelete } = useCrudManager<DonationPage>({
    collectionName: 'donations',
    blobFolderName: 'donation',
    itemSchema: initialDonationState,
  });

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
      {donations.map((d) => (
        <Box key={d.id} p={3} bg="white" borderRadius="md" boxShadow="sm">
          <DonationCard
            donation={d}
            currentAmount={
              d.donors?.reduce((acc, donor) => acc + (donor.value || 0), 0) || 0
            }
            onEdit={() => router.push(`/admin/donations/${d.id}/edit`)}
            onDelete={() => handleDelete(d.id)}
            actionEnabled={false}
          />
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default DonationsPage;
