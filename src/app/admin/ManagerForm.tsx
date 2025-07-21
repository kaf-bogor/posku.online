'use client';

import { VStack, Button, HStack, Box, Heading } from '@chakra-ui/react';
import type { ReactNode, FormEvent } from 'react';
import 'react-quill/dist/quill.snow.css';

import type { DonationPage } from '~/lib/types/donation';
import type { EventItem } from '~/lib/types/event';
import type { NewsItem } from '~/lib/types/news';

interface ManagerFormProps {
  formState: Omit<DonationPage | EventItem | NewsItem, 'id'> | null;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  isEdit?: boolean;
  children?: ReactNode; // Untuk field spesifik
  title: string;
}

export default function ManagerForm({
  formState,
  onSubmit,
  onCancel,
  isEdit = false,
  children,
  title,
}: ManagerFormProps) {
  if (!formState) return null;

  return (
    <Box
      p={4}
      mb={8}
      borderWidth="1px"
      borderRadius="md"
      borderColor="gray.200"
      bg="chakra-body-bg._dark"
    >
      <form onSubmit={onSubmit}>
        <Heading size="sm" mb={4}>
          {title}
        </Heading>
        <VStack align="stretch" spacing={3}>
          {children}

          <HStack spacing={2} mt={4}>
            <Button colorScheme={isEdit ? 'blue' : 'green'} type="submit">
              {isEdit ? 'Save Changes' : 'Add Item'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}
