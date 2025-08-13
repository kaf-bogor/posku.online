import { VStack, Text } from '@chakra-ui/react';
import { compareDesc, getDate, parseISO, lastDayOfMonth } from 'date-fns';
import { useState, useEffect, useCallback, useContext } from 'react';

import { AppContext } from '~/lib/context/app';

import Card from './SalesData/Card';
import type { Transaction, TransactionData } from './SalesData/types';

export default function SalesDataCard({
  title,
  branch,
  salesDate,
}: {
  title: string;
  branch: string;
  salesDate: string;
}) {
  const [salesData, setSalesData] = useState<Transaction[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { bgColor } = useContext(AppContext);

  function calculateTotalPrice(data: Transaction[]): number {
    return data.reduce((total, sale) => total + sale.currentOmzet, 0);
  }

  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch(`/api/token?branch=${branch}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();

      setToken(data.token);
      // Don't set loading to false here - let fetchSalesData handle it
      /* eslint-disable-next-line */
    } catch (err) {
      setError('An error occurred while fetching data');
      setIsLoading(false);
    }
  }, [branch]);

  const fetchSalesData = useCallback(
    async (accessToken: string) => {
      // Parse the year and month from the string
      const [year, month] = salesDate.split('-').map(Number);

      // Check if the selected month is in the future
      const selectedMonth = new Date(year, month - 1, 1);
      const today = new Date();
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      if (selectedMonth > currentMonth) {
        // Future month - don't fetch data, just show empty state
        setSalesData([]);
        setIsLoading(false);
        return;
      }

      // Create a Date object for the first day of the given month
      const firstDayOfMonth = new Date(year, month - 1);

      // Get the last day of the month
      const lastDateOfMonth = getDate(lastDayOfMonth(firstDayOfMonth));
      const formattedDate = `${salesDate}-${lastDateOfMonth}`;
      try {
        const response = await fetch(
          `/api/majoo?date=${formattedDate}&token=${accessToken}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data: TransactionData[] = await response.json();

        // Filter data to show only for the selected month, but not future dates
        const selectedMonthStart = new Date(year, month - 1, 1);
        const selectedMonthEnd = lastDayOfMonth(selectedMonthStart);

        // Don't show data beyond today's date
        const effectiveEndDate =
          selectedMonthEnd > today ? today : selectedMonthEnd;

        const monthStartString = selectedMonthStart.toISOString().split('T')[0];
        const monthEndString = effectiveEndDate.toISOString().split('T')[0];

        // Filter using TransactionData (snake_case) properties
        const filteredData = data.filter((item: TransactionData) => {
          // Extract just the date part (YYYY-MM-DD) from current_date
          const itemDateString = item.current_date.split('T')[0];
          return (
            itemDateString >= monthStartString &&
            itemDateString <= monthEndString
          );
        });

        // Convert TransactionData to Transaction format and sort
        const convertedData: Transaction[] = filteredData.map(
          (item: TransactionData) => ({
            date: item.date,
            previousDate: item.previous_date,
            currentDate: item.current_date,
            previousCount: item.previous_count,
            previousOmzet: item.previous_omzet,
            currentCount: item.current_count,
            currentOmzet: item.current_omzet,
            growthPercent: item.growth_percent,
          })
        );

        const sortedData = convertedData.sort(
          (a: Transaction, b: Transaction) => {
            return compareDesc(
              parseISO(a.currentDate),
              parseISO(b.currentDate)
            );
          }
        );

        setSalesData(sortedData);
        setIsLoading(false);
        /* eslint-disable-next-line */
      } catch (err) {
        setError('An error occurred while fetching data');
        setIsLoading(false);
      }
    },
    [salesDate]
  );

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    if (token) {
      setError(null);
      setIsLoading(true);
      fetchSalesData(token);
    } else {
      setError('Token is not provided');
    }
  }, [fetchSalesData, token]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <VStack
      alignItems="center"
      p={4}
      boxShadow="md"
      borderRadius="xl"
      border="1px solid gray"
      bg={bgColor}
    >
      <VStack>
        <Text fontSize="2xl" fontWeight="bold" mb={0}>
          {title}
        </Text>
        <Text fontSize="xl" fontWeight="bold" mb={0} color="green.300">
          Rp. {calculateTotalPrice(salesData).toLocaleString('id')}
        </Text>
      </VStack>

      <VStack
        spacing={4}
        mt={3}
        align="stretch"
        overflow="scroll"
        height="400px"
      >
        {salesData.map((data) => {
          return <Card data={data} />;
        })}
      </VStack>
    </VStack>
  );
}
