'use client';

import { Text, HStack, VStack, useBreakpointValue } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useState } from 'react';

import SalesDataCard from './SalesData';

const SalesChart = () => {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM')
  );

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <VStack gap={5}>
      <VStack>
        <Text fontSize="2xl" fontWeight="bold" m={0}>
          Data Penjualan (Omset)
        </Text>
        <Text fontSize="sm" m={0}>
          Kentungan sekitar 15%-30% dari omset
        </Text>
        <input
          type="month"
          id="start"
          name="start"
          min="2023-09"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </VStack>
      {isMobile ? (
        <VStack spacing={4} align="stretch">
          <SalesDataCard
            title="Lingkar Dramaga"
            branch="LD"
            salesDate={selectedDate}
          />
          <SalesDataCard
            title="Atang Sanjaya"
            branch="ATS"
            salesDate={selectedDate}
          />
        </VStack>
      ) : (
        <HStack
          justifyContent="start"
          alignItems="start"
          spacing={8}
          wrap="wrap"
        >
          <SalesDataCard
            title="Lingkar Dramaga"
            branch="LD"
            salesDate={selectedDate}
          />
          <SalesDataCard
            title="Atang Sanjaya"
            branch="ATS"
            salesDate={selectedDate}
          />
        </HStack>
      )}
    </VStack>
  );
};

export default SalesChart;
