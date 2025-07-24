import { Box, Button, Heading, Flex, Text } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import { FaTrash } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';
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
  const { bgColor, borderColor, textColor } = useContext(AppContext);

  // Show more/less state
  const [showAll, setShowAll] = useState(false);

  // Always sort donors by newest date so latest donors appear at the top
  const sortedDonors = [...donors].sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  );

  const displayedDonors = showAll ? sortedDonors : sortedDonors.slice(0, 10);

  return (
    <Box
      className="card"
      bg={bgColor}
      color={textColor}
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
          color={textColor}
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
          color={textColor}
          borderBottom="1px solid"
          borderColor={borderColor}
          py={2}
          px={2}
          gap={2}
        >
          <Box />
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
            color={textColor}
            py={6}
            fontSize="md"
            borderRadius="md"
            bg="gray.50"
            mt={2}
          >
            Belum ada donatur.
          </Box>
        ) : (
          displayedDonors.map((row, idx) => (
            <Flex
              key={row.name + row.datetime}
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'flex-start', md: 'center' }}
              borderBottom="1px solid"
              borderColor={borderColor}
              py={3}
              px={2}
              gap={{ base: 0, md: 2 }}
              _last={{ borderBottom: 'none' }}
              bg={{ base: bgColor, md: 'transparent' }}
              borderRadius={{ base: 'md', md: 'none' }}
              mb={{ base: 3, md: 0 }}
              color={textColor}
            >
              <Box>{idx + 1}.</Box>
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
                  {row?.donorsCount && row.donorsCount > 1
                    ? ` - ${row.donorsCount} donatur`
                    : null}
                </Text>
              </Box>
              {/* Nominal */}
              <Box flex="1" w="100%" textAlign={{ base: 'left', md: 'right' }}>
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
                    color={textColor}
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

        {donors.length > 10 && (
          <Box textAlign="center" mt={4}>
            <Button size="sm" onClick={() => setShowAll((prev) => !prev)}>
              {showAll ? 'Show Less' : 'Show More'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
