'use client';

import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';

import ManagerForm from '~/app/admin/ManagerForm';
import { AppContext } from '~/lib/context/app';
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { DonationPage } from '~/lib/types/donation';
import { initialDonationState } from '~/lib/types/donation';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ADMIN_DONATIONS_PATH = '/admin/amal';

export default function AddDonationPage() {
  const router = useRouter();
  const { bgColor } = useContext(AppContext);

  const { form, setForm, selectedFiles, setSelectedFiles, handleAdd } =
    useCrudManager<DonationPage>({
      collectionName: 'donations',
      blobFolderName: 'donation',
      itemSchema: initialDonationState,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      await handleAdd(e);
      router.push(ADMIN_DONATIONS_PATH);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding donation:', error);
    }
  };

  const handleTargetChange = (value: string) => {
    setForm({ ...form, target: Number(value) });
  };

  return (
    <VStack align="stretch" spacing={4} bg={bgColor} p={4}>
      <Heading size="md">Add New Donation</Heading>

      <ManagerForm
        formState={form}
        onSubmit={handleSubmit}
        onCancel={() => router.push(ADMIN_DONATIONS_PATH)}
        title="Add New Donation"
      >
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Summary</FormLabel>
          <ReactQuill
            theme="snow"
            value={form.summary}
            onChange={(value) => setForm({ ...form, summary: value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Target (Rp)</FormLabel>
          <NumberInput
            value={form.target}
            min={0}
            onChange={handleTargetChange}
          >
            <NumberInputField name="target" />
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Link</FormLabel>
          <Input
            name="link"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired={selectedFiles.length === 0}>
          <FormLabel>Images</FormLabel>
          <Input
            type="file"
            name="images"
            accept="image/*"
            multiple
            onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
          />
        </FormControl>
      </ManagerForm>
    </VStack>
  );
}
