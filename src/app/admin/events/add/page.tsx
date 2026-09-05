'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Flex,
  Input,
  Checkbox,
  FormControl,
  FormLabel,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';
import useAuth from '~/lib/hooks/useAuth';
import { createEvent } from '~/lib/services/contentService';
import { uploadImages } from '~/lib/services/uploadService';
import { generateSlug } from '~/lib/utils/slug';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const LIST_PATH = '/admin/events';

const emptyForm = {
  title: '',
  slug: '',
  summary: '',
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  location: '',
  isActive: false,
};

export default function AddEventPage() {
  useAuth('admin');
  const router = useRouter();
  const toast = useToast();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);

  const { bgColor, borderColor } = useContext(AppContext);
  const titleColor = useColorModeValue('gray.800', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const imageUrls = await uploadImages(files, 'events');
      await createEvent({
        ...form,
        title: form.title.trim(),
        slug: form.slug || generateSlug(form.title),
        summary: form.summary,
        imageUrls,
      });
      toast({ title: 'Acara ditambahkan', status: 'success', duration: 3000 });
      router.push(LIST_PATH);
    } catch (err) {
      toast({
        title: 'Gagal menyimpan',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Button
          variant="link"
          leftIcon={<FaArrowLeft />}
          colorScheme="blue"
          mb={1}
          onClick={() => router.push(LIST_PATH)}
        >
          Kembali
        </Button>
        <Heading size="lg" color={titleColor}>
          Buat Acara
        </Heading>
        <Text color={muted} fontSize="sm" mt={1}>
          Tambahkan acara & kegiatan untuk halaman publik.
        </Text>
      </Box>

      <Box
        p={5}
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="xl"
        shadow="sm"
      >
        <form onSubmit={handleSubmit}>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Judul Acara</FormLabel>
              <Input
                value={form.title}
                placeholder="cth: Kajian Bulanan Orang Tua"
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
              <FormLabel>Slug (otomatis)</FormLabel>
              <Input value={form.slug} isReadOnly bg="gray.50" />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Deskripsi</FormLabel>
              <ReactQuill
                theme="snow"
                value={form.summary}
                onChange={(value) => setForm({ ...form, summary: value })}
              />
            </FormControl>

            <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
              <FormControl isRequired>
                <FormLabel>Mulai</FormLabel>
                <Input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Selesai</FormLabel>
                <Input
                  type="date"
                  value={form.endDate.split('T')[0]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      endDate: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </FormControl>
            </Flex>

            <FormControl isRequired>
              <FormLabel>Lokasi</FormLabel>
              <Input
                value={form.location}
                placeholder="cth: Masjid Jami' At-Taqwa AURI"
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </FormControl>

            <Checkbox
              isChecked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              colorScheme="green"
            >
              Tampilkan di publik
            </Checkbox>

            <FormControl>
              <FormLabel>Gambar</FormLabel>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
            </FormControl>

            <Flex justify="flex-end" gap={3}>
              <Button
                variant="outline"
                onClick={() => router.push(LIST_PATH)}
                isDisabled={saving}
              >
                Batal
              </Button>
              <Button
                colorScheme="green"
                type="submit"
                isLoading={saving}
                loadingText="Menyimpan..."
              >
                Tambah Acara
              </Button>
            </Flex>
          </VStack>
        </form>
      </Box>
    </VStack>
  );
}
