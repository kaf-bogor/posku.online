import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';

export default function NominalUpdates() {
  const sumberDanaData: { sumber: string; nominal: string }[] = [
    { sumber: 'Kas Bilistiwa', nominal: 'Rp 1.400.000.000' },
    { sumber: 'Wakaf Hamba Allah', nominal: 'Rp 200.000.000' },
    { sumber: 'Wakaf Mini Soccer', nominal: 'Rp 3.225.000' },
  ];

  return (
    <Box className="card" bg="white" rounded="xl" shadow="md" p={6} w="full">
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
      <Box overflowX="auto">
        <Table
          variant="simple"
          bg="white"
          border="1px"
          borderColor="gray.200"
          rounded="lg"
        >
          <Thead>
            <Tr bg="gray.100" borderBottom="1px" borderColor="gray.200">
              <Th
                px={6}
                py={3}
                textAlign="left"
                fontSize="sm"
                fontWeight="semibold"
                color="gray.600"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Sumber Dana
              </Th>
              <Th
                px={6}
                py={3}
                textAlign="right"
                fontSize="sm"
                fontWeight="semibold"
                color="gray.600"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Nominal
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {sumberDanaData.map((row) => (
              <Tr key={row.sumber} _hover={{ bg: 'gray.50' }}>
                <Td
                  px={6}
                  py={4}
                  whiteSpace="nowrap"
                  fontSize="lg"
                  color="gray.900"
                >
                  {row.sumber}
                </Td>
                <Td
                  px={6}
                  py={4}
                  whiteSpace="nowrap"
                  textAlign="right"
                  fontSize="lg"
                  fontWeight="medium"
                  color="green.700"
                >
                  {row.nominal}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
