import { Box, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import { FaCalendarAlt } from 'react-icons/fa';

export default function EmptySection({
  resourceName,
}: {
  resourceName: string;
}) {
  const emptyBg = useColorModeValue('gray.50', 'gray.600');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box bg={emptyBg} borderRadius="xl" p={12} textAlign="center">
      <VStack spacing={4}>
        <FaCalendarAlt fontSize="48px" color={emptyTextColor} />
        <Text color={emptyTextColor} fontSize="lg" fontWeight="medium">
          Belum ada {resourceName} yang tersedia
        </Text>
        <Text color={emptyTextColor} fontSize="sm">
          {resourceName} akan muncul di sini setelah dibuat oleh admin.
        </Text>
      </VStack>
    </Box>
  );
}
