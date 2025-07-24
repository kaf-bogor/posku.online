import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { useContext, useState } from 'react';
import type React from 'react';

import { AppContext } from '~/lib/context/app';
import type { DonationPage } from '~/lib/types/donation';

type OrganizerFormProps = {
  organizer: DonationPage['organizer'];
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

function OrganizerFormSection({ organizer, onFormChange }: OrganizerFormProps) {
  const [localOrganizer, setLocalOrganizer] = useState({
    avatar: organizer?.avatar || '',
    name: organizer?.name || '',
    tagline: organizer?.tagline || '',
  });
  const { bgColor, textColor, borderColor } = useContext(AppContext);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalOrganizer((prev) => ({
      ...prev,
      [name.replace('organizer.', '')]: value,
    }));
    if (onFormChange) onFormChange(e);
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
        Organizer
      </Heading>
      <VStack align="stretch" spacing={2}>
        <FormControl>
          <FormLabel>Avatar URL</FormLabel>
          <Input
            name="organizer.avatar"
            onChange={handleInputChange}
            value={localOrganizer.avatar}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input
            name="organizer.name"
            onChange={handleInputChange}
            value={localOrganizer.name}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Tagline</FormLabel>
          <Input
            name="organizer.tagline"
            onChange={handleInputChange}
            value={localOrganizer.tagline}
          />
        </FormControl>
      </VStack>
    </Box>
  );
}

export default OrganizerFormSection;
