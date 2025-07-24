import {
  Box,
  Heading,
  VStack,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
} from '@chakra-ui/react';
import { useState, useEffect, useContext, useRef, useCallback } from 'react';

import Donors from '~/app/reports/wakaf_ats/Donors';
import { AppContext } from '~/lib/context/app';
import type { Donor } from '~/lib/types/donation';

export default function DonorsFormSection({
  donors,
  onFormChange,
}: {
  donors: Donor[];
  onFormChange: (donors: Donor[]) => void;
}) {
  const [localDonors, setLocalDonors] = useState<Donor[]>(donors);
  const { bgColor, borderColor, textColor } = useContext(AppContext);

  useEffect(() => {
    // Ensure incoming donors are sorted by newest first
    const sorted = [...donors].sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    );
    setLocalDonors(sorted);
  }, [donors]);

  const [newDonor, setNewDonor] = useState({
    id: localDonors.length + 1,
    name: '',
    value: '',
    datetime: '',
    donorsCount: 1,
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        setNewDonor((prev) => ({
          ...prev,
          [name]: value,
        }));
      }, 300);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleAddDonor = () => {
    if (!newDonor.name || !newDonor.value || !newDonor.datetime) return;
    const newDonors = [
      ...localDonors,
      {
        id: localDonors.length + 1,
        name: newDonor.name,
        donorsCount: newDonor.donorsCount,
        value: Number(newDonor.value),
        datetime: newDonor.datetime,
      },
    ];
    // Sort so the newest donor is always at the top
    const sorted = newDonors.sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    );
    setLocalDonors(sorted);
    onFormChange(sorted);
    setNewDonor({
      id: newDonors.length + 1,
      name: '',
      value: '',
      datetime: '',
      donorsCount: 1,
    });
  };

  const handleRemoveDonor = (donorId: number) => {
    const updatedDonors = localDonors.filter((donor) => donor.id !== donorId);
    setLocalDonors(updatedDonors);
    onFormChange(updatedDonors);
  };

  return (
    <Box
      mt={4}
      p={3}
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      bg={bgColor}
      color={textColor}
    >
      <Heading size="xs" mb={2}>
        Donors
      </Heading>
      <VStack align="stretch" spacing={2}>
        {/* Add Donor Form */}
        <Flex
          align="flex-end"
          mt={2}
          gap={2}
          direction={{ base: 'column', md: 'row' }}
        >
          <FormControl>
            <FormLabel mb={1}>Nama</FormLabel>
            <Input
              name="name"
              onChange={handleInputChange}
              size="sm"
              placeholder="Donor name"
            />
          </FormControl>
          <FormControl>
            <FormLabel mb={1}>Nominal</FormLabel>
            <Input
              name="value"
              type="text"
              onChange={handleInputChange}
              size="sm"
              placeholder="Amount"
            />
          </FormControl>
          <FormControl>
            <FormLabel mb={1}>Waktu</FormLabel>
            <Input
              name="datetime"
              type="datetime-local"
              onChange={handleInputChange}
              size="sm"
            />
          </FormControl>
          <FormControl>
            <FormLabel mb={1}>Jumlah donatur</FormLabel>
            <Input
              name="donorsCount"
              type="text"
              onChange={handleInputChange}
              size="sm"
              placeholder="Jumlah donatur"
            />
          </FormControl>
          <Button
            colorScheme="green"
            size="sm"
            onClick={handleAddDonor}
            isDisabled={!newDonor.name || !newDonor.value || !newDonor.datetime}
            borderRadius="md"
            w={{ base: '100%', md: '30px' }}
          >
            Add
          </Button>
        </Flex>
        {localDonors && localDonors.length > 0 ? (
          <Box overflowX="auto">
            <Donors
              donors={localDonors.map((d) => ({
                ...d,
                value: Number(d.value),
                datetime: new Date(d.datetime).toISOString(),
              }))}
              withHeading={false}
              onRemove={(donorId) => handleRemoveDonor(donorId)}
            />
          </Box>
        ) : (
          <Box color="gray.400" fontSize="sm">
            No donors yet.
          </Box>
        )}
      </VStack>
    </Box>
  );
}
