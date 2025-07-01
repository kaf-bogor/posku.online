import { Box, Heading } from '@chakra-ui/react';

export const items: { sumber: string; nominal: number }[] = [
  { sumber: 'Kas Bilistiwa', nominal: 1400000000 },
  { sumber: 'Dari Hamba Allah', nominal: 200000000 },
  { sumber: 'Dari Komunitas Mini Soccer', nominal: 3225000 },
];

export default function NominalUpdates({
  withHeading = true,
}: {
  withHeading?: boolean;
}) {
  return (
    <Box className="card" bg="white" rounded="xl" shadow="md" p={6} w="full">
      {withHeading && (
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
      )}
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
        {items.map((row) => (
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
              Rp {row.nominal.toLocaleString('id-ID')}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
