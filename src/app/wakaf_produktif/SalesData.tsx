import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import { Box, Circle, Flex, HStack, VStack, Text } from '@chakra-ui/react';
import {
  compareDesc,
  format,
  getDate,
  parseISO,
  lastDayOfMonth,
} from 'date-fns';
import { id } from 'date-fns/locale';
import { useState, useEffect, useCallback } from 'react';

export default function SalesDataCard({
  title,
  branch,
  salesDate,
}: {
  title: string;
  branch: string;
  salesDate: string;
}) {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function calculateTotalPrice(data: SalesData[]): number {
    return data.reduce((total, sale) => total + sale.price, 0);
  }

  function formatToRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch(`/api/token?branch=${branch}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();

      setToken(data.token);
      setIsLoading(false);
    } catch (err) {
      setError('An error occurred while fetching data');
      setIsLoading(false);
    }
  }, [branch]);

  const fetchSalesData = useCallback(
    async (accessToken: string) => {
      const formattedDate = `${salesDate}-${getDate(lastDayOfMonth(new Date()))}`;
      try {
        const response = await fetch(
          `/api/majoo?date=${formattedDate}&token=${accessToken}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const sortedData = data.sort((a: SalesData, b: SalesData) => {
          return compareDesc(parseISO(a.date), parseISO(b.date));
        });

        setSalesData(sortedData);
        setIsLoading(false);
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
    >
      <VStack>
        <Text fontSize="2xl" fontWeight="bold" mb={0}>
          {title}
        </Text>
        <Text fontSize="xl" fontWeight="bold" mb={0} color="green">
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
        {salesData.map(({ date, count, price }, index) => {
          const prevPrice =
            index < salesData.length - 1 ? salesData[index + 1].price : price;
          const prevSales =
            index < salesData.length - 1 ? salesData[index + 1].count : count;
          const percentageSalesChange =
            prevSales !== 0 ? ((count - prevSales) / prevSales) * 100 : 0;
          const percentagePriceChange =
            prevPrice !== 0 ? ((price - prevPrice) / prevPrice) * 100 : 0;
          const isSalesIncrease = percentageSalesChange >= 0;
          const isPriceIncrease = percentagePriceChange >= 0;

          return (
            <Flex key={date} alignItems="center">
              <Circle size="40px" bg="blue.500" color="white" mr={4}>
                {getDate(date)}
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
                  {format(parseISO(date), 'EEEE, dd MMMM yyyy', {
                    locale: id,
                  })}
                </Text>
                <HStack>
                  <Text>Sales: {count}</Text>
                  {index > 0 && (
                    <Flex alignItems="center" mt={1}>
                      {isSalesIncrease ? (
                        <ArrowUpIcon color="green.500" />
                      ) : (
                        <ArrowDownIcon color="red.500" />
                      )}
                      <Text
                        ml={1}
                        color={isSalesIncrease ? 'green.500' : 'red.500'}
                        fontWeight="bold"
                      >
                        {Math.abs(percentageSalesChange).toFixed(2)}%
                      </Text>
                    </Flex>
                  )}
                </HStack>
                <HStack>
                  <Text>Total: {formatToRupiah(price)}</Text>
                  {index > 0 && (
                    <Flex alignItems="center" mt={1}>
                      {isPriceIncrease ? (
                        <ArrowUpIcon color="green.500" />
                      ) : (
                        <ArrowDownIcon color="red.500" />
                      )}
                      <Text
                        ml={1}
                        color={isPriceIncrease ? 'green.500' : 'red.500'}
                        fontWeight="bold"
                      >
                        {Math.abs(percentagePriceChange).toFixed(2)}%
                      </Text>
                    </Flex>
                  )}
                </HStack>
                <Text color="purple">
                  Transaksi avg: {formatToRupiah(price / count)}
                </Text>
              </Box>
            </Flex>
          );
        })}
      </VStack>
    </VStack>
  );
}

export interface SalesData {
  date: string;
  count: number;
  price: number;
}
