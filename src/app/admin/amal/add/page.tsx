'use client';

import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  useToast,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';

import ManagerForm from '~/app/admin/ManagerForm';
import { AppContext } from '~/lib/context/app';
import { createDonation, getAdminToken } from '~/lib/services/donationService';
import type { DonationPage } from '~/lib/types/donation';
import { initialDonationState } from '~/lib/types/donation';
import { generateSlug } from '~/lib/utils/slug';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ADMIN_DONATIONS_PATH = '/admin/amal';

export default function AddDonationPage() {
  const router = useRouter();
  const toast = useToast();
  const { bgColor } = useContext(AppContext);

  const [form, setForm] = useState<Omit<DonationPage, 'id'>>({
    ...initialDonationState,
    is_active: true,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const uploadImagesToServer = async (files: File[], category: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('category', category);
    const response = await fetch('/api/upload/images', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload images');
    }

    const data = await response.json();
    return data.imageUrls as string[];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = await getAdminToken();
      if (!token) throw new Error('Anda harus login sebagai admin');

      const imageUrls = await uploadImagesToServer(selectedFiles, 'donation');
      await createDonation(token, { ...form, imageUrls });

      toast({
        title: 'Sukses',
        description: 'Kampanye amal berhasil ditambahkan.',
        status: 'success',
        duration: 3000,
      });
      router.push(ADMIN_DONATIONS_PATH);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding donation:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Terjadi kesalahan',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
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
        isLoading={isSaving}
      >
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input
            name="title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
                slug: generateSlug(e.target.value),
              })
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>Slug</FormLabel>
          <Input
            name="slug"
            value={form.slug ?? ''}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="auto-generated from title"
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
