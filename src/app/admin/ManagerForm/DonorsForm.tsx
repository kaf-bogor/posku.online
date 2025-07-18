import {
  Box,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
} from '@chakra-ui/react';
import { id } from 'date-fns/locale';
import { useState } from 'react';
import type React from 'react';

import Donors from '~/app/reports/wakaf_ats/Donors';
import type { Donor } from '~/lib/types/donation';

export default function DonorsFormSection({
  donors,
  onFormChange,
}: {
  donors: Donor[];
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}) {
  const [newDonor, setNewDonor] = useState({
    id: donors.length + 1,
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

  const handleAddDonor = (donorId: number) => {
    if (!newDonor.name || !newDonor.value || !newDonor.datetime) return;
    const newDonors = [
      ...(donors || []),
      {
        id,
        name: newDonor.name,
        value: Number(newDonor.value),
        datetime: newDonor.datetime,
      },
    ];
    onFormChange({
      target: {
        name: 'donors',
        value: newDonors,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
    setNewDonor({ id: donorId + 1, name: '', value: '', datetime: '' });
  };

  const handleRemoveDonor = (idx: number) => {
    const updatedDonors = donors.filter((_, i) => i !== idx);
    onFormChange({
      target: {
        name: 'donors',
        value: updatedDonors,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <Box
      mt={4}
      p={3}
      borderWidth="1px"
      borderRadius="md"
      borderColor="gray.200"
      bg="white"
    >
      <Heading size="xs" mb={2}>
        Donors
      </Heading>
      <VStack align="stretch" spacing={2}>
        {donors && donors.length > 0 ? (
          <Box overflowX="auto">
            <Donors
              donors={donors.map((d) => ({
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
        <HStack align="flex-end" mt={2}>
          <FormControl>
            <FormLabel mb={1}>Name</FormLabel>
            <Input
              name="name"
              value={newDonor.name}
              onChange={handleInputChange}
              size="sm"
              placeholder="Donor name"
            />
          </FormControl>
          <FormControl>
            <FormLabel mb={1}>Value</FormLabel>
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
            <FormLabel mb={1}>Datetime</FormLabel>
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
            onClick={() => handleAddDonor(donors.length + 1)}
            isDisabled={!newDonor.name || !newDonor.value || !newDonor.datetime}
          >
            Add
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
