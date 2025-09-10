import { Box, Text } from '@chakra-ui/react';
import { getDate, lastDayOfMonth } from 'date-fns';
import { useState, useEffect, useCallback, useContext } from 'react';

import { AppContext } from '~/lib/context/app';

import Chart from './SalesData/Chart';
import type { Transaction, TransactionData } from './SalesData/types';

interface BranchConfig {
  title: string;
  branch: string;
  color: string;
}

interface MultiBranchChartProps {
  salesDate: string;
  branches: BranchConfig[];
}

export default function MultiBranchChart({
  salesDate,
  branches,
}: MultiBranchChartProps) {
  const { bgColor } = useContext(AppContext);
  const [allBranchesData, setAllBranchesData] = useState<
    Array<{ branchName: string; data: Transaction[]; color: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBranchData = useCallback(
    async (branchConfig: BranchConfig) => {
      try {
        // Fetch token for this branch
        const tokenResponse = await fetch(
          `/api/token?branch=${branchConfig.branch}`
        );
        if (!tokenResponse.ok) {
          throw new Error(`Failed to fetch token for ${branchConfig.title}`);
        }
        const tokenData = await tokenResponse.json();

        // Parse the year and month from the string
        const [year, month] = salesDate.split('-').map(Number);

        // Check if the selected month is in the future
        const selectedMonth = new Date(year, month - 1, 1);
        const today = new Date();
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        if (selectedMonth > currentMonth) {
          // Future month - return empty data
          return {
            branchName: branchConfig.title,
            data: [],
            color: branchConfig.color,
          };
        }

        // Create a Date object for the first day of the given month
        const firstDayOfMonth = new Date(year, month - 1);
        const lastDateOfMonth = getDate(lastDayOfMonth(firstDayOfMonth));
        const formattedDate = `${salesDate}-${lastDateOfMonth}`;

        // Fetch sales data
        const salesResponse = await fetch(
          `/api/majoo?date=${formattedDate}&token=${tokenData.token}`
        );
        if (!salesResponse.ok) {
          throw new Error(
            `Failed to fetch sales data for ${branchConfig.title}`
          );
        }
        const salesData: TransactionData[] = await salesResponse.json();

        // Filter data to show only for the selected month, but not future dates
        const selectedMonthStart = new Date(year, month - 1, 1);
        const selectedMonthEnd = lastDayOfMonth(selectedMonthStart);

        // Don't show data beyond today's date
        const effectiveEndDate =
          selectedMonthEnd > today ? today : selectedMonthEnd;

        const monthStartString = selectedMonthStart.toISOString().split('T')[0];
        const monthEndString = effectiveEndDate.toISOString().split('T')[0];

        // Filter using TransactionData (snake_case) properties
        const filteredData = salesData.filter((item: TransactionData) => {
          const itemDateString = item.current_date.split('T')[0];
          return (
            itemDateString >= monthStartString &&
            itemDateString <= monthEndString
          );
        });

        // Convert TransactionData to Transaction format and aggregate daily data
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

        // Aggregate daily data to get correct monthly totals
        const sortedData =
          convertedData.length > 0
            ? [
                {
                  date: salesDate,
                  previousDate: salesDate,
                  currentDate: salesDate,
                  previousCount: convertedData.reduce(
                    (sum, item) => sum + item.previousCount,
                    0
                  ),
                  previousOmzet: convertedData.reduce(
                    (sum, item) => sum + item.previousOmzet,
                    0
                  ),
                  currentCount: convertedData.reduce(
                    (sum, item) => sum + item.currentCount,
                    0
                  ),
                  currentOmzet: convertedData.reduce(
                    (sum, item) => sum + item.currentOmzet,
                    0
                  ),
                  growthPercent: (() => {
                    const totalPrevious = convertedData.reduce(
                      (sum, item) => sum + item.previousOmzet,
                      0
                    );
                    const totalCurrent = convertedData.reduce(
                      (sum, item) => sum + item.currentOmzet,
                      0
                    );
                    return totalPrevious > 0
                      ? ((totalCurrent - totalPrevious) / totalPrevious) * 100
                      : 0;
                  })(),
                },
              ]
            : [];

        return {
          branchName: branchConfig.title,
          data: sortedData,
          color: branchConfig.color,
        };
      } catch (fetchError) {
        setError(
          `Error fetching data for ${branchConfig.title}: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`
        );
        return {
          branchName: branchConfig.title,
          data: [],
          color: branchConfig.color,
        };
      }
    },
    [salesDate]
  );

  useEffect(() => {
    const fetchAllBranchesData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const promises = branches.map((branch) => fetchBranchData(branch));
        const results = await Promise.all(promises);
        setAllBranchesData(results);
      } catch {
        setError('Failed to fetch data for some branches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBranchesData();
  }, [branches, fetchBranchData]);

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Text>Loading chart data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Text color="red.500">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box w="full" bg={bgColor} p={6}>
      <Chart
        branches={allBranchesData}
        title="Semua Cabang - Progres Penjualan Harian"
      />
    </Box>
  );
}
