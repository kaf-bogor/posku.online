import { Box, Text } from '@chakra-ui/react';

export default function Empty({
  message = 'No data available',
}: {
  message?: string;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={4}
    >
      <Text fontSize="lg" textAlign="center">
        {message}
      </Text>
    </Box>
  );
}
