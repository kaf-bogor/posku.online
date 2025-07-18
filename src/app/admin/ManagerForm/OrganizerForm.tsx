import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import type React from 'react';

type OrganizerFormProps = {
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

function OrganizerFormSection({ onFormChange }: OrganizerFormProps) {
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
        Organizer
      </Heading>
      <VStack align="stretch" spacing={2}>
        <FormControl>
          <FormLabel>Avatar URL</FormLabel>
          <Input name="organizer.avatar" onChange={onFormChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input name="organizer.name" onChange={onFormChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Tagline</FormLabel>
          <Input name="organizer.tagline" onChange={onFormChange} />
        </FormControl>
      </VStack>
    </Box>
  );
}

export default OrganizerFormSection;
