import { Box, Heading } from '@chakra-ui/react';

export default function NominalUpdates() {
  const sumberDanaData: { sumber: string; nominal: string }[] = [
    { sumber: 'Kas Bilistiwa', nominal: 'Rp 1.400.000.000' },
    { sumber: 'Wakaf Hamba Allah', nominal: 'Rp 200.000.000' },
    { sumber: 'Wakaf Mini Soccer', nominal: 'Rp 3.225.000' },
  ];

  return (
    <Box
      className="card"
      bg="white"
      rounded="xl"
      shadow="md"
      p={6}
      maxW="md"
      mx="auto"
    >
      <Heading
        as="h2"
        fontSize="3xl"
        fontWeight="bold"
        color="gray.800"
        mb={6}
        textAlign="center"
      >
        Pembaruan Nominal Dana
      </Heading>
      <Box w="full" display="flex" flexDirection="column" gap={2}>
        {/* Header Row */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bg="gray.100"
          borderBottom="1px solid"
          borderColor="gray.200"
          px={4}
          py={2}
          fontWeight="semibold"
          color="gray.600"
          fontSize="sm"
          textTransform="uppercase"
          letterSpacing="wider"
          rounded="md"
        >
          <Box>Sumber Dana</Box>
          <Box textAlign="right">Nominal</Box>
        </Box>
        {/* Data Rows */}
        {sumberDanaData.map((row) => (
          <Box
            key={row.sumber}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bg="white"
            borderBottom="1px solid"
            borderColor="gray.100"
            px={4}
            py={3}
            fontSize="md"
            rounded="md"
            _hover={{ bg: 'gray.50' }}
          >
            <Box color="gray.900" fontWeight="medium">
              {row.sumber}
            </Box>
            <Box
              color="green.700"
              fontWeight="bold"
              textAlign="right"
              minW="120px"
            >
              {row.nominal}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
