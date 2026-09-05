'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Flex,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';
import useAuth from '~/lib/hooks/useAuth';
import { createAttendanceEvent } from '~/lib/services/attendanceService';

const LIST_PATH = '/admin/kehadiran';

export default function AddAttendanceEventPage() {
  useAuth('admin');
  const router = useRouter();
  const toast = useToast();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '' });

  const { bgColor, borderColor } = useContext(AppContext);
  const titleColor = useColorModeValue('gray.800', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    try {
      await createAttendanceEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        date: new Date(form.date).toISOString(),
      });
      toast({
        title: 'Event kehadiran ditambahkan',
        status: 'success',
        duration: 3000,
      });
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
          Buat Event Kehadiran
        </Heading>
        <Text color={muted} fontSize="sm" mt={1}>
          Tambahkan acara untuk pencatatan kehadiran.
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
              <FormLabel>Judul Event</FormLabel>
              <Input
                value={form.title}
                placeholder="cth: Parenting Nabawiyah"
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
                Tambah Event
              </Button>
            </Flex>
          </VStack>
        </form>
      </Box>
    </VStack>
  );
}
