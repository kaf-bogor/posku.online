import { Box, Text } from '@chakra-ui/react';
import { compareDesc, parseISO, lastDayOfMonth } from 'date-fns';
import { useState, useEffect, useCallback, useContext } from 'react';

import { AppContext } from '~/lib/context/app';

import Chart from './SalesData/Chart';
import type { Transaction, TransactionData } from './SalesData/types';

function calculateTotalPrice(data: Transaction[]): number {
  return data.reduce((total, sale) => total + sale.currentOmzet, 0);
}

interface BranchConfig {
  title: string;
  branch: string;
  color: string;
}

interface YearlyMultiBranchChartProps {
  selectedYear: string;
  branches: BranchConfig[];
}

export const YearlyMultiBranchChart = ({
  selectedYear,
  branches,
}: YearlyMultiBranchChartProps) => {
  const { bgColor } = useContext(AppContext);
  const [allBranchesData, setAllBranchesData] = useState<
    Array<{ branchName: string; data: Transaction[]; color: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranchYearlyData = useCallback(
    async (branchConfig: BranchConfig) => {
      try {
        // Get token for this branch
        const tokenResponse = await fetch(
          `/api/token?branch=${branchConfig.branch}`
        );
        if (!tokenResponse.ok) {
          throw new Error('Failed to fetch token');
        }
        const tokenData = await tokenResponse.json();

        // Generate all months for the selected year with day 01
        const months = Array.from({ length: 12 }, (_, i) => {
          const month = (i + 1).toString().padStart(2, '0');
          return `${selectedYear}-${month}-01`;
        });

        // Fetch data for each month
        const monthlyDataPromises = months.map(async (monthDate) => {
          try {
            const salesResponse = await fetch(
              `/api/majoo?date=${monthDate}&token=${tokenData.token}`
            );
            if (!salesResponse.ok) {
              return []; // Return empty array for failed months
            }
            const salesData: TransactionData[] = await salesResponse.json();

            // Parse the year and month from the string
            const [year, month] = monthDate.split('-').map(Number);
            const monthStart = new Date(year, month - 1, 1);
            const monthEnd = lastDayOfMonth(monthStart);
            const today = new Date();

            // Limit end date to today if we're in a current/future month
            const actualEndDate = monthEnd > today ? today : monthEnd;

            const monthStartString = monthStart.toISOString().split('T')[0];
            const monthEndString = actualEndDate.toISOString().split('T')[0];

            // Filter data for the month
            const filteredData = salesData.filter((item: TransactionData) => {
              const itemDateString = item.current_date.split('T')[0];
              return (
                itemDateString >= monthStartString &&
                itemDateString <= monthEndString
              );
            });

            // Convert to Transaction format
            return filteredData.map((item: TransactionData) => ({
              date: item.date,
              previousDate: item.previous_date,
              currentDate: item.current_date,
              previousCount: item.previous_count,
              previousOmzet: item.previous_omzet,
              currentCount: item.current_count,
              currentOmzet: item.current_omzet,
              growthPercent: item.growth_percent,
            }));
          } catch {
            return []; // Return empty array for failed requests
          }
        });

        // Wait for all monthly data
        const monthlyDataResults = await Promise.all(monthlyDataPromises);

        // Aggregate daily data into monthly totals
        const monthlyAggregatedData: Transaction[] = [];
        monthlyDataResults.forEach((monthData, monthIndex) => {
          if (monthData.length > 0) {
            // Calculate monthly totals using calculateTotalPrice function
            const currentOmzet = calculateTotalPrice(monthData);
            const previousOmzet = monthData.reduce(
              (total, dailyData) => total + dailyData.previousOmzet,
              0
            );
            const currentCount = monthData.reduce(
              (total, dailyData) => total + dailyData.currentCount,
              0
            );
            const previousCount = monthData.reduce(
              (total, dailyData) => total + dailyData.previousCount,
              0
            );

            // Calculate growth percentage for the month
            const growthPercent =
              previousOmzet > 0
                ? ((currentOmzet - previousOmzet) / previousOmzet) * 100
                : 0;

            // Create a single data point for this month
            const monthString = (monthIndex + 1).toString().padStart(2, '0');
            const monthDate = `${selectedYear}-${monthString}-01`;

            monthlyAggregatedData.push({
              date: monthDate,
              previousDate: monthDate,
              currentDate: monthDate,
              previousCount,
              previousOmzet,
              currentCount,
              currentOmzet,
              growthPercent,
            });
          }
        });

        // Sort by date (should already be in order, but just to be sure)
        const sortedData = monthlyAggregatedData.sort(
          (a: Transaction, b: Transaction) => {
            return compareDesc(
              parseISO(a.currentDate),
              parseISO(b.currentDate)
            );
          }
        );

        return {
          branchName: branchConfig.title,
          data: sortedData,
          color: branchConfig.color,
        };
      } catch (fetchError) {
        setError(
          `Error fetching yearly data for ${branchConfig.title}: ${
            fetchError instanceof Error
              ? fetchError.message
              : String(fetchError)
          }`
        );
        return {
          branchName: branchConfig.title,
          data: [],
          color: branchConfig.color,
        };
      }
    },
    [selectedYear]
  );

  useEffect(() => {
    const fetchAllBranchesYearlyData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const promises = branches.map((branch) =>
          fetchBranchYearlyData(branch)
        );
        const results = await Promise.all(promises);
        setAllBranchesData(results);
      } catch {
        setError('Failed to fetch yearly data for some branches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBranchesYearlyData();
  }, [branches, fetchBranchYearlyData]);

  if (isLoading) {
    return (
      <Box w="full" bg={bgColor} p={6} textAlign="center">
        <Text>Memuat data tahunan...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box w="full" bg={bgColor} p={6} textAlign="center">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Box w="full" bg={bgColor} p={6}>
      <Chart
        branches={allBranchesData}
        title={`Semua Cabang - Progres Penjualan Tahunan (${selectedYear})`}
        viewMode="yearly"
      />
    </Box>
  );
};

export default YearlyMultiBranchChart;
