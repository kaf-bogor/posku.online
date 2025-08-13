import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import { Flex, Circle, Box, VStack, HStack, Text } from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

import type { Transaction } from './types';

function formatToRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Card({ data }: { data: Transaction }) {
  const {
    date,
    currentDate,
    currentCount,
    previousCount,
    currentOmzet,
    previousOmzet,
    growthPercent,
  } = data;

  const salesChange = currentCount - previousCount;
  const isGrowthPositive = growthPercent >= 0;
  const isSalesIncrease = salesChange >= 0;

  return (
    <Flex key={date} alignItems="center">
      <Circle size="40px" bg="blue.500" color="white" mr={4}>
        {date}
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
          {format(parseISO(currentDate), 'EEEE, dd MMMM yyyy', {
            locale: id,
          })}
        </Text>
        <VStack align="start" spacing={1}>
          <HStack>
            <Text fontSize="sm">Sales:</Text>
            <Text fontWeight="bold">{currentCount}</Text>
            <Text fontSize="xs">({previousCount})</Text>
            <Flex alignItems="center">
              {isSalesIncrease ? (
                <ArrowUpIcon color="green.500" boxSize={3} />
              ) : (
                <ArrowDownIcon color="red.500" boxSize={3} />
              )}
              <Text
                ml={1}
                color={isSalesIncrease ? 'green.500' : 'red.500'}
                fontWeight="bold"
                fontSize="xs"
              >
                {Math.abs(salesChange)}
              </Text>
            </Flex>
          </HStack>
          <HStack>
            <Text fontSize="sm">Omzet:</Text>
            <Text fontWeight="bold">{formatToRupiah(currentOmzet)}</Text>
            <Text fontSize="xs">({formatToRupiah(previousOmzet)})</Text>
          </HStack>
          <HStack>
            <Text fontSize="sm">Growth:</Text>
            <Flex alignItems="center">
              {isGrowthPositive ? (
                <ArrowUpIcon color="green.500" boxSize={3} />
              ) : (
                <ArrowDownIcon color="red.500" boxSize={3} />
              )}
              <Text
                ml={1}
                color={isGrowthPositive ? 'green.500' : 'red.500'}
                fontWeight="bold"
                fontSize="sm"
              >
                {growthPercent.toFixed(2)}%
              </Text>
            </Flex>
          </HStack>
          <Text color="purple.300" fontSize="xs">
            Avg per transaksi:{' '}
            {currentCount > 0
              ? formatToRupiah(currentOmzet / currentCount)
              : 'N/A'}
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}
