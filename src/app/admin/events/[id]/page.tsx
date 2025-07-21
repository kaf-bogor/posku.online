'use client';

import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Heading,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

import DonorsFormSection from '../../ManagerForm/DonorsForm';
import type { Donor } from '~/lib/types/donation';

const EventDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // Placeholder for donors data, should be fetched based on event ID
  const [donors, setDonors] = useState<Donor[]>([]);

  const handleDonorsChange = (updatedDonors: Donor[]) => {
    setDonors(updatedDonors);
    // Optionally, sync with backend here
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Event Detail
      </Heading>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Event Details</Tab>
          <Tab>Donors</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box>
              <p>Details for event ID: {id}</p>
              {/* Fetch and display event details using the ID */}
            </Box>
          </TabPanel>
          <TabPanel>
            <DonorsFormSection
              donors={donors}
              onFormChange={handleDonorsChange}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default EventDetailPage;
