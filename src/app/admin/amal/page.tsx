'use client';

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
    <>
      {donations.map((d) => (
        <DonationCard
          donation={d}
          onEdit={() => router.push(`/admin/amal/${d.id}/edit`)}
        />
      ))}
    </>
  );
};

export default DonationsPage;
