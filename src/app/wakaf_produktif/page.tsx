'use client';

import {
  Text,
  HStack,
  VStack,
  useBreakpointValue,
  Select,
  Box,
} from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';

import { AppContext } from '~/lib/context/app';

import MultiBranchChart from './MultiBranchChart';
import SalesDataCard from './SalesData';
import { YearlyMultiBranchChart } from './YearlyMultiBranchChart';

const WakafProduktif = () => {
  const { setTitle } = useContext(AppContext);

  const [selectedDate, setSelectedDate] = useState('2024-12');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState('2024');

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(event.target.value);
  };

  useEffect(() => {
    setTitle('Wakaf produktif');
  }, [setTitle]);

  const branchConfigs = [
    { title: 'Lingkar Dramaga', branch: 'LD', color: 'rgb(59, 130, 246)' },
    { title: 'Atang Sanjaya', branch: 'ATS', color: 'rgb(34, 197, 94)' },
  ];

  return (
    <VStack gap={5}>
      <VStack>
        <Text fontSize="sm" m={0}>
          Kentungan sekitar 15%-30% dari omset
        </Text>
        {/* View Mode Selector */}
        <HStack spacing={4} align="center">
          <Box>
            <Text fontSize="sm" mb={1}>
              Mode Tampilan:
            </Text>
            <Select
              size="sm"
              value={viewMode}
              onChange={(e) =>
                setViewMode(e.target.value as 'monthly' | 'yearly')
              }
              width="120px"
            >
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </Select>
          </Box>
          {viewMode === 'monthly' ? (
            <Box>
              <Text fontSize="sm" mb={1}>
                Bulan:
              </Text>
              <input
                type="month"
                id="start"
                name="start"
                min="2023-09"
                value={selectedDate}
                onChange={handleDateChange}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </Box>
          ) : (
            <Box>
              <Text fontSize="sm" mb={1}>
                Tahun:
              </Text>
              <Select
                size="sm"
                value={selectedYear}
                onChange={handleYearChange}
                width="100px"
              >
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </Select>
            </Box>
          )}
        </HStack>
      </VStack>

      {/* Chart based on view mode */}
      {viewMode === 'monthly' ? (
        <MultiBranchChart salesDate={selectedDate} branches={branchConfigs} />
      ) : (
        <YearlyMultiBranchChart
          selectedYear={selectedYear}
          branches={branchConfigs}
        />
      )}
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
