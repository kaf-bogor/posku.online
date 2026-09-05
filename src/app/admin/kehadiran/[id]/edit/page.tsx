'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Spinner,
  Flex,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';
import useAuth from '~/lib/hooks/useAuth';
import {
  getAttendanceEvent,
  updateAttendanceEvent,
} from '~/lib/services/attendanceService';

const ADMIN_PATH = '/admin/kehadiran';

export default function EditAttendanceEventPage() {
  useAuth('admin');
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    date: string;
  } | null>(null);

  const { bgColor, borderColor } = useContext(AppContext);
  const titleColor = useColorModeValue('gray.800', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const event = await getAttendanceEvent(id);
      if (!event) {
        toast({
          title: 'Tidak ditemukan',
          description: 'Event kehadiran tidak ditemukan.',
          status: 'error',
          duration: 4000,
        });
        router.push(ADMIN_PATH);
        return;
      }
      setForm({
        title: event.title,
        description: event.description,
        date: event.date ? event.date.slice(0, 16) : '',
      });
    } catch (err) {
      toast({
        title: 'Gagal memuat',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
        status: 'error',
        duration: 5000,
      });
      router.push(ADMIN_PATH);
    } finally {
      setLoading(false);
    }
  }, [id, router, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !id) return;
    setSaving(true);
    try {
      await updateAttendanceEvent(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        date: new Date(form.date).toISOString(),
      });
      toast({
        title: 'Event kehadiran diperbarui',
        status: 'success',
        duration: 3000,
      });
      router.push(ADMIN_PATH);
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

  if (loading || !form) {
    return (
      <Box textAlign="center" py={16}>
        <Spinner size="xl" color="green.500" thickness="3px" />
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Button
          variant="link"
          leftIcon={<FaArrowLeft />}
          colorScheme="blue"
          mb={1}
          onClick={() => router.push(ADMIN_PATH)}
        >
          Kembali
        </Button>
        <Heading size="lg" color={titleColor}>
          Edit Event Kehadiran
        </Heading>
        <Text color={muted} fontSize="sm" mt={1}>
          Perbarui informasi event kehadiran.
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
        <form onSubmit={handleSave}>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Judul Event</FormLabel>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Deskripsi</FormLabel>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Tanggal & Waktu</FormLabel>
              <Input
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </FormControl>

            <Flex justify="flex-end" gap={3}>
              <Button
                variant="outline"
                onClick={() => router.push(ADMIN_PATH)}
                isDisabled={saving}
              >
                Batal
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={saving}
                loadingText="Menyimpan..."
              >
                Simpan Perubahan
              </Button>
            </Flex>
          </VStack>
        </form>
      </Box>
    </VStack>
  );
}
