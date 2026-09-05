'use client';

import {
  VStack,
  Heading,
  Spinner,
  Text,
  useToast,
  Input,
  Checkbox,
  FormControl,
  FormLabel,
  Box,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useContext } from 'react';

import ManagerForm from '~/app/admin/ManagerForm';
import { AppContext } from '~/lib/context/app';
import { getEvent, updateEvent } from '~/lib/services/contentService';
import type { EventItem } from '~/lib/types/event';
import { generateSlug } from '~/lib/utils/slug';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ADMIN_EVENT_PATH = '/admin/events';

export default function EditEventPage() {
  const router = useRouter();
  const toast = useToast();
  const { bgColor, borderColor } = useContext(AppContext);
  const { id: paramsId } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<EventItem, 'id'> | null>(null);

  const muted = useColorModeValue('gray.500', 'gray.400');
  const titleColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const fetchEvent = async () => {
      if (!paramsId) return;
      try {
        const data = await getEvent(paramsId);
        if (data) {
          const { id, ...rest } = data;
          setForm(rest);
        } else {
          toast({
            title: 'Tidak ditemukan',
            description: 'Acara tidak ditemukan.',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
          router.push(ADMIN_EVENT_PATH);
        }
      } catch (err) {
        toast({
          title: 'Error',
          description:
            err instanceof Error ? err.message : 'Gagal memuat acara.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
        router.push(ADMIN_EVENT_PATH);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [paramsId, router, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !paramsId) return;
    setSaving(true);
    try {
      await updateEvent(paramsId, form);
      toast({
        title: 'Tersimpan',
        description: 'Perubahan acara berhasil disimpan.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push(ADMIN_EVENT_PATH);
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Gagal menyimpan acara.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <VStack justify="center" py={20}>
        <Spinner />
        <Text color={muted}>Memuat acara...</Text>
      </VStack>
    );
  }

  const card = {
    borderWidth: '1px',
    borderColor,
    borderRadius: 'lg',
    bg: bgColor,
    p: 5,
  } as const;

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading size="lg" color={titleColor}>
          Edit Acara
        </Heading>
        <Text color={muted} fontSize="sm" mt={1}>
          Perbarui informasi acara. Perubahan langsung tersimpan untuk publik.
        </Text>
      </Box>

      <ManagerForm
        formState={form}
        onSubmit={handleSave}
        onCancel={() => router.push(ADMIN_EVENT_PATH)}
        title=""
        isEdit
        isLoading={saving}
      >
        {/* Informasi Dasar */}
        <Box {...card} w="100%">
          <Heading size="sm" mb={4} color={titleColor}>
            Informasi Dasar
          </Heading>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Judul Acara</FormLabel>
              <Input
                name="title"
                value={form.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setForm({
                    ...form,
                    title: newTitle,
                    slug: generateSlug(newTitle),
                  });
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Slug</FormLabel>
              <Input
                name="slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="url-friendly-slug"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Deskripsi</FormLabel>
              <ReactQuill
                theme="snow"
                value={form.summary}
                onChange={(value) => setForm({ ...form, summary: value })}
              />
            </FormControl>
          </VStack>
        </Box>

        {/* Detail Acara */}
        <Box {...card} w="100%">
          <Heading size="sm" mb={4} color={titleColor}>
            Detail Acara
          </Heading>
          <VStack align="stretch" spacing={4}>
            <HStack
              spacing={4}
              align="flex-end"
              direction={{ base: 'column', md: 'row' }}
            >
              <FormControl isRequired>
                <FormLabel>Mulai</FormLabel>
                <Input
                  type="date"
                  name="startDate"
                  value={form.startDate.split('T')[0]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      startDate: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Selesai</FormLabel>
                <Input
                  type="date"
                  name="endDate"
                  value={form.endDate.split('T')[0]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      endDate: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </FormControl>
            </HStack>

            <FormControl isRequired>
              <FormLabel>Lokasi</FormLabel>
              <Input
                name="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="cth: Masjid Jami' At-Taqwa AURI"
              />
            </FormControl>

            <Checkbox
              isChecked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              colorScheme="green"
            >
              Tampilkan di publik
            </Checkbox>
          </VStack>
        </Box>
      </ManagerForm>
    </VStack>
  );
}
