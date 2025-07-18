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
import { useState } from 'react';
import type React from 'react';

export default function DonorsFormSection({
  donors,
  onFormChange,
}: {
  donors: { name: string; value: number; datetime: string }[];
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}) {
  const [newDonor, setNewDonor] = useState({
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
      ...(donors || []),
      {
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
    setNewDonor({ name: '', value: '', datetime: '' });
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
          donors.map(
            (
              donor: { name: string; value: number; datetime: string },
              idx: number
            ) => (
              <HStack key={`${donor.name}-${donor.datetime}`} align="center">
                <Box minW="120px">{donor.name}</Box>
                <Box minW="80px">{donor.value}</Box>
                <Box minW="180px">{donor.datetime}</Box>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={() => handleRemoveDonor(idx)}
                >
                  Remove
                </Button>
              </HStack>
            )
          )
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
            onClick={handleAddDonor}
            isDisabled={!newDonor.name || !newDonor.value || !newDonor.datetime}
          >
            Add
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
