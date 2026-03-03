'use client';

import {
  Button,
  Box,
  HStack,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import { doc, writeBatch } from 'firebase/firestore';
import { Reorder, useDragControls } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaGripVertical } from 'react-icons/fa';

import DonationCard from '../components/DonationCard';
import { db } from '~/lib/firebase';
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { DonationPage } from '~/lib/types/donation';
import { initialDonationState } from '~/lib/types/donation';

const DraggableDonationItem = ({
  donation,
  onEdit,
}: {
  donation: DonationPage;
  onEdit: () => void;
}) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      key={donation.id}
      value={donation.id}
      dragListener={false}
      dragControls={controls}
      style={{ width: '100%' }}
    >
      <HStack align="stretch" spacing={3} w="full">
        <IconButton
          aria-label="Drag"
          icon={<FaGripVertical />}
          variant="ghost"
          alignSelf="center"
          cursor="grab"
          onPointerDown={(e) => controls.start(e)}
        />
        <Box flex="1">
          <DonationCard donation={donation} onEdit={onEdit} />
        </Box>
      </HStack>
    </Reorder.Item>
  );
};

const DonationsPage = () => {
  const router = useRouter();

  const { items: donations } = useCrudManager<DonationPage>({
    collectionName: 'donations',
    blobFolderName: 'donation',
    itemSchema: initialDonationState,
  });

  const [orderedDonations, setOrderedDonations] = useState<DonationPage[]>([]);

  useEffect(() => {
    const withFallbackOrder = [...donations].sort((a, b) => {
      const aOrder =
        typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
      const bOrder =
        typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return 0;
    });
    setOrderedDonations(withFallbackOrder);
  }, [donations]);

  const donationById = useMemo(() => {
    return orderedDonations.reduce<Record<string, DonationPage>>((acc, d) => {
      acc[d.id] = d;
      return acc;
    }, {});
  }, [orderedDonations]);

  const isDonationActive = (d: DonationPage) => {
    return d.is_active === true;
  };

  const activeDonations = useMemo(() => {
    return orderedDonations.filter(isDonationActive);
  }, [orderedDonations]);

  const inactiveDonations = useMemo(() => {
    return orderedDonations.filter((d) => !isDonationActive(d));
  }, [orderedDonations]);

  const persistTimersRef = useRef<
    Record<'active' | 'inactive', ReturnType<typeof setTimeout> | null>
  >({
    active: null,
    inactive: null,
  });

  const persistSubsetOrder = async (ids: string[]) => {
    const batch = writeBatch(db);
    ids.forEach((id, index) => {
      batch.update(doc(db, 'donations', id), { order: index });
    });
    await batch.commit();
  };

  const schedulePersistSubsetOrder = (
    subsetKey: 'active' | 'inactive',
    nextSubsetIds: string[]
  ) => {
    const prevTimer = persistTimersRef.current[subsetKey];
    if (prevTimer) clearTimeout(prevTimer);
    persistTimersRef.current[subsetKey] = setTimeout(() => {
      persistSubsetOrder(nextSubsetIds).catch(() => {
        // ignore
      });
    }, 500);
  };

  const mergeReorderedSubset = (
    nextSubsetIds: string[],
    subsetPredicate: (d: DonationPage) => boolean
  ) => {
    setOrderedDonations((prev) => {
      const subset = prev.filter(subsetPredicate);
      const subsetSet = new Set(subset.map((d) => d.id));

      const subsetById = subset.reduce<Record<string, DonationPage>>(
        (acc, d) => {
          acc[d.id] = d;
          return acc;
        },
        {}
      );

      const normalizedNextSubset = nextSubsetIds
        .filter((id) => subsetSet.has(id))
        .map((id) => subsetById[id])
        .filter(Boolean);

      let subsetIndex = 0;
      return prev.map((d) => {
        if (!subsetPredicate(d)) return d;
        const next = normalizedNextSubset[subsetIndex];
        subsetIndex += 1;
        return next ?? d;
      });
    });
  };

  return (
    <VStack align="stretch" spacing={4}>
      <Button
        alignSelf="start"
        colorScheme="green"
        onClick={() => router.push('/admin/amal/add')}
      >
        Tambah Amal
      </Button>

      <Tabs variant="soft-rounded" colorScheme="green">
        <TabList>
          <Tab>
            <HStack spacing={2}>
              <Text>Active</Text>
              <Text as="span">({activeDonations.length})</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <Text>Inactive</Text>
              <Text as="span">({inactiveDonations.length})</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Reorder.Group
              axis="y"
              values={activeDonations.map((d) => d.id)}
              onReorder={(nextIds) => {
                mergeReorderedSubset(nextIds, (d) => isDonationActive(d));
                schedulePersistSubsetOrder('active', nextIds);
              }}
              style={{ listStyle: 'none', padding: 0, margin: 0 }}
            >
              <VStack gap="16px" align="stretch">
                {activeDonations.map((d) => (
                  <DraggableDonationItem
                    key={d.id}
                    donation={donationById[d.id] ?? d}
                    onEdit={() => router.push(`/admin/amal/${d.id}/edit`)}
                  />
                ))}
              </VStack>
            </Reorder.Group>
          </TabPanel>

          <TabPanel px={0}>
            <Reorder.Group
              axis="y"
              values={inactiveDonations.map((d) => d.id)}
              onReorder={(nextIds) => {
                mergeReorderedSubset(nextIds, (d) => !isDonationActive(d));
                schedulePersistSubsetOrder('inactive', nextIds);
              }}
              style={{ listStyle: 'none', padding: 0, margin: 0 }}
            >
              <VStack gap="16px" align="stretch">
                {inactiveDonations.map((d) => (
                  <DraggableDonationItem
                    key={d.id}
                    donation={donationById[d.id] ?? d}
                    onEdit={() => router.push(`/admin/amal/${d.id}/edit`)}
                  />
                ))}
              </VStack>
            </Reorder.Group>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default DonationsPage;
