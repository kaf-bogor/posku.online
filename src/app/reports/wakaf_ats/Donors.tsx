import { Box, Button, Heading, Flex, Text } from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';

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
      bg="chakra-redbody-bg._dark"
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

      <Box>
        {/* Header for desktop */}
        <Flex
          display={{ base: 'none', md: 'flex' }}
          fontWeight="bold"
          color="chakra-body-text._dark"
          borderBottom="1px solid"
          borderColor="gray.200"
          py={2}
          px={2}
          gap={2}
        >
          <Box flex="2">Nama Donatur</Box>
          <Box flex="1" textAlign="right">
            Nominal
          </Box>
          <Box w={{ base: '100%', md: '100px' }} textAlign="center">
            Tanggal
          </Box>
          {onRemove && <Box flex="0 0 40px" />}
        </Flex>

        {/* Donor rows */}
        {donors.length === 0 ? (
          <Box
            textAlign="center"
            color="gray.500"
            py={6}
            fontSize="md"
            borderRadius="md"
            bg="gray.50"
            mt={2}
          >
            Belum ada donatur.
          </Box>
        ) : (
          [...donors]
            .sort(
              (a, b) =>
                new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
            )
            .map((row) => (
              <Flex
                key={row.name + row.datetime}
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'flex-start', md: 'center' }}
                borderBottom="1px solid"
                borderColor="gray.100"
                py={3}
                px={2}
                gap={{ base: 0, md: 2 }}
                _last={{ borderBottom: 'none' }}
                bg={{ base: 'gray.50', md: 'transparent' }}
                borderRadius={{ base: 'md', md: 'none' }}
                mb={{ base: 3, md: 0 }}
                color="chakra-body-text._dark"
              >
                {/* Name */}
                <Box flex="2" w="100%">
                  <Text fontWeight="medium" fontSize={{ base: 'md', md: 'sm' }}>
                    <Box
                      as="span"
                      display={{ base: 'inline', md: 'none' }}
                      fontWeight="normal"
                      mr={2}
                    >
                      Nama Donatur:
                    </Box>
                    {row.name}
                  </Text>
                </Box>
                {/* Nominal */}
                <Box
                  flex="1"
                  w="100%"
                  textAlign={{ base: 'left', md: 'right' }}
                >
                  <Text
                    color="green.700"
                    fontWeight="bold"
                    fontSize={{ base: 'md', md: 'sm' }}
                  >
                    <Box
                      as="span"
                      display={{ base: 'inline', md: 'none' }}
                      fontWeight="normal"
                      mr={2}
                    >
                      Nominal:
                    </Box>
                    Rp {row.value.toLocaleString('id-ID')}
                  </Text>
                </Box>
                {/* Date */}
                <Box
                  w={{ base: '100%', md: '100px' }}
                  textAlign={{ base: 'left', md: 'center' }}
                >
                  <Text fontSize={{ base: 'md', md: 'sm' }}>
                    <Box
                      as="span"
                      display={{ base: 'inline', md: 'none' }}
                      color="gray.500"
                      fontWeight="normal"
                      mr={2}
                    >
                      Tanggal:
                    </Box>
                    {new Date(row.datetime).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </Box>
                {/* Remove button */}
                {onRemove && (
                  <Box
                    flex="0 0 20px"
                    w={{ base: '100%', md: '40px' }}
                    mt={{ base: 2, md: 0 }}
                  >
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => onRemove(row.id)}
                      w={{ base: '100%', md: 'auto' }}
                    >
                      <FaTrash size={16} />
                    </Button>
                  </Box>
                )}
              </Flex>
            ))
        )}
      </Box>
    </Box>
  );
}
