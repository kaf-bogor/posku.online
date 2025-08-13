import { Box, VStack, Select, Text, useColorModeValue } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import React, { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';

import type { Transaction } from './types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  branches: Array<{
    branchName: string;
    data: Transaction[];
    color: string;
  }>;
  title?: string;
  viewMode?: 'monthly' | 'yearly';
}

type ChartType = 'line' | 'bar';
type DataType = 'sales' | 'omzet' | 'growth';

export default function Chart({
  branches,
  title = 'Progres Penjualan Harian',
  viewMode = 'monthly',
}: ChartProps) {
  // Get actual CSS color values for Chart.js
  const chartTextColor = useColorModeValue('#000000', '#F7FAFC');
  const [chartType, setChartType] = React.useState<ChartType>('line');
  const [dataType, setDataType] = React.useState<DataType>('sales');

  // Get all unique dates from all branches and sort them
  const allDates = React.useMemo(() => {
    const dateSet = new Set<string>();
    branches.forEach((branch) => {
      branch.data.forEach((item) => {
        dateSet.add(item.currentDate);
      });
    });
    return Array.from(dateSet).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
  }, [branches]);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    const labels = allDates.map((date) => {
      if (viewMode === 'yearly') {
        // For yearly view, show only month names
        return format(parseISO(date), 'MMM yyyy', { locale: id });
      }
      // For monthly view, show day and month
      return format(parseISO(date), 'dd MMM', { locale: id });
    });

    const datasets = branches.map((branch) => {
      // Create a map of date to data for this branch
      const dataMap = new Map<string, Transaction>();
      branch.data.forEach((item) => {
        dataMap.set(item.currentDate, item);
      });

      // Get data for each date, using null if no data exists for that date
      const branchData = allDates.map((date) => {
        const item = dataMap.get(date);
        if (!item) return null;

        if (dataType === 'sales') {
          return item.currentCount;
        }
        if (dataType === 'omzet') {
          return item.currentOmzet;
        }
        return item.growthPercent;
      });

      return {
        label: branch.branchName,
        data: branchData,
        borderColor: branch.color,
        backgroundColor: `${branch.color}20`, // Add transparency
        tension: 0.1,
        spanGaps: true, // Connect points even if there are null values
      };
    });

    return {
      labels,
      datasets,
    };
  }, [allDates, branches, dataType, viewMode]);

  // Chart options
  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: chartTextColor,
          },
        },
        title: {
          display: true,
          text: title,
          color: chartTextColor,
        },
        tooltip: {
          callbacks: {
            label(context: {
              dataset: { label?: string };
              parsed: { y: number };
            }) {
              let label = context.dataset.label || '';
              if (label) label += ': ';

              if (dataType === 'omzet') {
                return `${label}${new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(context.parsed.y)}`;
              }
              if (dataType === 'growth') {
                return `${label}${context.parsed.y.toFixed(2)}%`;
              }
              return `${label}${context.parsed.y}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: true,
            color: `${chartTextColor}20`, // Add transparency to grid lines
          },
          ticks: {
            color: chartTextColor,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: `${chartTextColor}20`, // Add transparency to grid lines
          },
          ticks: {
            color: chartTextColor,
            maxTicksLimit: 8,
            callback(value: string | number) {
              const numValue =
                typeof value === 'string' ? parseFloat(value) : value;
              if (dataType === 'omzet') {
                return new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                  notation: 'compact',
                }).format(numValue);
              }
              if (dataType === 'growth') {
                return `${numValue}%`;
              }
              return numValue;
            },
            stepSize: (() => {
              if (dataType === 'omzet') {
                const maxValue = Math.max(
                  ...branches.flatMap((branch) =>
                    branch.data.map((item) => item.currentOmzet)
                  )
                );
                const rawStep = maxValue / 10;
                if (rawStep >= 1_000_000)
                  return Math.ceil(rawStep / 500_000) * 500_000;
                if (rawStep >= 100_000)
                  return Math.ceil(rawStep / 100_000) * 100_000;
                if (rawStep >= 10_000)
                  return Math.ceil(rawStep / 10_000) * 10_000;
                return Math.ceil(rawStep / 1_000) * 1_000;
              }
              if (dataType === 'sales') {
                const maxValue = Math.max(
                  ...branches.flatMap((branch) =>
                    branch.data.map((item) => item.currentCount)
                  )
                );
                const rawStep = maxValue / 10;
                if (rawStep >= 100) return Math.ceil(rawStep / 50) * 50;
                if (rawStep >= 10) return Math.ceil(rawStep / 10) * 10;
                return Math.ceil(rawStep / 5) * 5;
              }
              return undefined;
            })(),
          },
        },
      },
    }),
    [branches, dataType, chartTextColor, title]
  );

  if (
    branches.length === 0 ||
    branches.every((branch) => branch.data.length === 0)
  ) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500">Data tidak tersedia untuk grafik</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <Box display="flex" gap={4} flexWrap="wrap">
        <Box>
          <Text fontSize="sm" mb={1}>
            Jenis Grafik:
          </Text>
          <Select
            size="sm"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            width="120px"
          >
            <option value="line">Garis</option>
            <option value="bar">Batang</option>
          </Select>
        </Box>
        <Box>
          <Text fontSize="sm" mb={1}>
            Jenis Data:
          </Text>
          <Select
            size="sm"
            value={dataType}
            onChange={(e) => setDataType(e.target.value as DataType)}
            width="180px"
          >
            <option value="sales">Jumlah Penjualan</option>
            <option value="omzet">Omzet</option>
            <option value="growth">Pertumbuhan %</option>
          </Select>
        </Box>
      </Box>
      <Box height="350px" width="100%">
        {chartType === 'line' ? (
          <Line
            key={`line-${chartTextColor}`}
            data={chartData}
            options={options}
          />
        ) : (
          <Bar
            key={`bar-${chartTextColor}`}
            data={chartData}
            options={options}
          />
        )}
      </Box>
    </VStack>
  );
}
