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
import { useState, useEffect } from 'react';

import Donors from '~/app/reports/wakaf_ats/Donors';
import type { Donor } from '~/lib/types/donation';

export default function DonorsFormSection({
  donors,
  onFormChange,
}: {
  donors: Donor[];
  onFormChange: (donors: Donor[]) => void;
}) {
  const [localDonors, setLocalDonors] = useState<Donor[]>(donors);

  useEffect(() => {
    setLocalDonors(donors);
  }, [donors]);

  const [newDonor, setNewDonor] = useState({
    id: localDonors.length + 1,
    name: '',
    value: '',
    datetime: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDonor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddDonor = () => {
    if (!newDonor.name || !newDonor.value || !newDonor.datetime) return;
    const newDonors = [
      ...localDonors,
      {
        id: localDonors.length + 1,
        name: newDonor.name,
        value: Number(newDonor.value),
        datetime: newDonor.datetime,
      },
    ];
    setLocalDonors(newDonors);
    onFormChange(newDonors);
    setNewDonor({
      id: newDonors.length + 1,
      name: '',
      value: '',
      datetime: '',
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
      borderColor="gray.200"
      bg="chakra-body-bg._light"
    >
      <Heading size="xs" mb={2}>
        Donors
      </Heading>
      <VStack align="stretch" spacing={2}>
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
              value={newDonor.name}
              onChange={handleInputChange}
              size="sm"
              placeholder="Donor name"
            />
          </FormControl>
          <FormControl>
            <FormLabel mb={1}>Nominal</FormLabel>
            <Input
              name="value"
              type="number"
              value={newDonor.value}
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
              value={newDonor.datetime}
              onChange={handleInputChange}
              size="sm"
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
      </VStack>
    </Box>
  );
}
