'use client';

import { Text, HStack, VStack, useBreakpointValue } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useContext, useEffect, useState } from 'react';

import { AppContext, siteConfig } from '~/lib/context/app';

import SalesDataCard from './SalesData';

const WakafProduktif = () => {
  const { title, subtitle, setTitle, setSubtitle } = useContext(AppContext);

  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM')
  );

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    setTitle('Wakaf produktif');
    setSubtitle(
      'Laporan data penjualan (omset) wakaf produktif kuttab Al-Fatih Bogor'
    );
    return () => {
      setTitle(siteConfig.title);
      setSubtitle(siteConfig.subtitle);
    };
  }, [title, subtitle, setTitle, setSubtitle]);

  return (
    <VStack gap={5}>
      <VStack>
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

export default WakafProduktif;
