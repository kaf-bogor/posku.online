import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';

import type { Donor } from '~/lib/types/donation';

/**
 * Component to display a list of donors.
 * @param {Object} props - The component props.
 * @param {Donor[]} props.donors - The list of donors to display.
 * @param {boolean} [props.withHeading=true] - Whether to show the heading.
 * @param {Function} [props.onRemove] - Optional callback for removing a donor.
 */
export default function Donors({
  donors,
  withHeading = true,
  onRemove,
}: {
  donors: Donor[];
  withHeading?: boolean;
  onRemove?: (donorId: number) => void;
}) {
  return (
    <Box
      className="card"
      bg="white"
      rounded="xl"
      shadow="md"
      p={withHeading ? 6 : 0}
      w="full"
      overflowX="auto"
    >
      {withHeading && (
        <Heading
          as="h2"
          fontSize="3xl"
          fontWeight="bold"
          color="gray.800"
          mb={6}
          textAlign="center"
        >
          Daftar Donatur
        </Heading>
      )}
      <Table variant="simple" size="md">
        <Thead>
          <Tr>
            <Th>Nama Donatur</Th>
            <Th isNumeric>Nominal</Th>
            <Th>Tanggal</Th>
            {onRemove && <Th />}
          </Tr>
        </Thead>
        <Tbody>
          {donors.length === 0 ? (
            <Tr>
              <Td colSpan={3} textAlign="center" color="gray.500">
                Belum ada donatur.
              </Td>
            </Tr>
          ) : (
            [...donors]
              .sort(
                (a, b) =>
                  new Date(b.datetime).getTime() -
                  new Date(a.datetime).getTime()
              )
              .map((row) => (
                <Tr key={row.name + row.datetime}>
                  <Td fontWeight="medium" color="gray.900">
                    {row.name}
                  </Td>
                  <Td
                    color="green.700"
                    fontWeight="bold"
                    isNumeric
                    minW="120px"
                  >
                    Rp {row.value.toLocaleString('id-ID')}
                  </Td>
                  <Td color="gray.600" fontSize="sm" minW="120px">
                    {new Date(row.datetime).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Td>
                  {onRemove && (
                    <td style={{ padding: '4px', paddingLeft: '12px' }}>
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() => onRemove(row.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  )}
                </Tr>
              ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
