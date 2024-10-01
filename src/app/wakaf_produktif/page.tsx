'use client';

import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import { VStack, Box, Text, Flex, Circle, HStack } from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState, useEffect } from 'react';

function formatToRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const SalesChart = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM')
  );

  const fetchSalesData = async (date: string) => {
    const formattedDate = `${date}-30`;
    try {
      const response = await fetch(`/api/majoo?date=${formattedDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const { data } = await response.json();
      setSalesData(data);
      setIsLoading(false);
    } catch (err) {
      setError('An error occurred while fetching data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  function calculateTotalPrice(data: SalesData[]): number {
    return data.reduce((total, sale) => total + sale.price, 0);
  }

  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" mb={4} color="green">
        Total Penjualan: Rp.{' '}
        {calculateTotalPrice(salesData).toLocaleString('id')}
      </Text>
      <HStack>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          Sales Timeline
        </Text>
        <input
          type="month"
          id="start"
          name="start"
          min="2024-09"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </HStack>

      <VStack spacing={4} align="stretch">
        {salesData.map(({ date, count, price }, index) => {
          const prevPrice = index > 0 ? salesData[index - 1].price : price;
          const percentageChange = ((price - prevPrice) / prevPrice) * 100;
          const isIncrease = percentageChange >= 0;

          return (
            <Flex key={date} alignItems="center">
              <Circle size="40px" bg="blue.500" color="white" mr={4}>
                {index + 1}
              </Circle>
              <Box
                flex={1}
                borderLeft="2px"
                borderColor="gray.200"
                pl={4}
                pb={4}
                position="relative"
              >
                <Box
                  position="absolute"
                  left="-5px"
                  top="0"
                  width="8px"
                  height="8px"
                  borderRadius="full"
                  bg="blue.500"
                />
                <Text fontWeight="bold">
                  {format(parseISO(date), 'EEEE, dd MMMM yyyy', { locale: id })}
                </Text>
                <Text>Sales: {count}</Text>
                <HStack>
                  <Text>Total: {formatToRupiah(price)}</Text>
                  {index > 0 && (
                    <Flex alignItems="center" mt={1}>
                      {isIncrease ? (
                        <ArrowUpIcon color="green.500" />
                      ) : (
                        <ArrowDownIcon color="red.500" />
                      )}
                      <Text
                        ml={1}
                        color={isIncrease ? 'green.500' : 'red.500'}
                        fontWeight="bold"
                      >
                        {Math.abs(percentageChange).toFixed(2)}%
                      </Text>
                    </Flex>
                  )}
                </HStack>
              </Box>
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
};

export default SalesChart;

interface SalesData {
  date: string;
  count: number;
  price: number;
}
