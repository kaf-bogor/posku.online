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

const EventDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Event Detail
      </Heading>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Event Details</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box>
              <p>Details for event ID: {id}</p>
              {/* Fetch and display event details using the ID */}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default EventDetailPage;
