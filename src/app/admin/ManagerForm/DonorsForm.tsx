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
import { doc, updateDoc } from 'firebase/firestore';
import { useState, useEffect, useContext } from 'react';

import Donors from '~/app/reports/wakaf_ats/Donors';
import { AppContext } from '~/lib/context/app';
import { db } from '~/lib/firebase';
import type { Donor } from '~/lib/types/donation';

const DEFAULT_NAME = 'Hamba Allah';
interface DonorsFormProps {
  donors: Donor[];
  donationId: string;
}

export default function DonorsFormSection({
  donors,
  donationId,
}: DonorsFormProps) {
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
    name: DEFAULT_NAME,
    value: '',
    datetime: '',
    donorsCount: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDonor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddDonor = async () => {
    if (!newDonor.name || !newDonor.value || !newDonor.datetime) return;
    const newDonors = [
      ...localDonors,
      {
        id: localDonors.length + 1,

        name: newDonor.name,
        donorsCount: Number(newDonor.donorsCount) || 1,
        value: Number(newDonor.value),
        datetime: newDonor.datetime,
      },
    ];
    // Sort so the newest donor is always at the top
    const sorted = newDonors.sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    );
    setLocalDonors(sorted);
    try {
      const donationRef = doc(db, 'donations', donationId);
      await updateDoc(donationRef, { donors: sorted });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update donors', err);
    }
    setNewDonor({
      id: newDonors.length + 1,
      name: DEFAULT_NAME,
      value: '',
      datetime: '',
      donorsCount: 1,
    });
  };

  const handleRemoveDonor = async (donorId: number) => {
    const updatedDonors = localDonors.filter((donor) => donor.id !== donorId);
    setLocalDonors(updatedDonors);
    try {
      const donationRef = doc(db, 'donations', donationId);
      await updateDoc(donationRef, { donors: updatedDonors });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to remove donor', err);
    }
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
              value={newDonor.name}
              onChange={handleInputChange}
              size="sm"
              placeholder="Hamba Allah"
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
          <FormControl>
            <FormLabel mb={1}>Jumlah donatur</FormLabel>
            <Input
              name="donorsCount"
              type="number"
              value={String(newDonor.donorsCount ?? '')}
              onChange={handleInputChange}
              size="sm"
              placeholder="Jumlah donatur"
            />
          </FormControl>
          <Button
            colorScheme="green"
            size="sm"
            onClick={handleAddDonor}
            isDisabled={!newDonor.value || !newDonor.datetime}
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
