import {
  VStack,
  HStack,
  Text,
  Progress as ChakraProgress,
  useColorModeValue,
} from '@chakra-ui/react';
import { useContext } from 'react';
import { FaUsers } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';
import type { Donor } from '~/lib/types/donation';
import { formatIDR } from '~/lib/utils/currency';

export default function Progress({
  totalCollected,
  target,
  progress,
  donors,
}: {
  totalCollected: number;
  target: number;
  progress: number;
  donors: Donor[];
}) {
  const accentColor = useColorModeValue('green.500', 'green.400');
  const progressBg = useColorModeValue('gray.100', 'gray.600');
  const iconColor = useColorModeValue('gray.400', 'gray.500');
  const titleColor = useColorModeValue('gray.800', 'white');

  const { textColor } = useContext(AppContext);

  return (
    <VStack spacing={3} align="stretch">
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={0}>
          <Text fontSize="xs" color={textColor} fontWeight="medium">
            Terkumpul
          </Text>
          <Text fontSize="xl" fontWeight="bold" color={accentColor}>
            {formatIDR(totalCollected)}
          </Text>
        </VStack>
        <VStack align="end" spacing={0}>
          <Text fontSize="xs" color={textColor} fontWeight="medium">
            Target
          </Text>
          <Text fontSize="lg" fontWeight="semibold" color={titleColor}>
            {formatIDR(target)}
          </Text>
        </VStack>
      </HStack>
      {/* Progress Bar */}
      <VStack spacing={2} align="stretch">
        <ChakraProgress
          value={progress}
          colorScheme="green"
          size="lg"
          borderRadius="full"
          bg={progressBg}
        />
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <FaUsers color={iconColor} />
            <Text fontSize="sm" color={textColor} fontWeight="medium">
              {donors?.length || 0} donatur
            </Text>
          </HStack>
          <Text fontSize="sm" color={textColor} fontWeight="medium">
            {progress.toFixed(1)}% dari target
          </Text>
        </HStack>
      </VStack>
    </VStack>
  );
}
