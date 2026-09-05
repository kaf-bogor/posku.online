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
  Checkbox,
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
import { createNews } from '~/lib/services/contentService';
import { uploadImages } from '~/lib/services/uploadService';
import { generateSlug } from '~/lib/utils/slug';

const LIST_PATH = '/admin/news';

export default function AddNewsPage() {
  useAuth('admin');
  const router = useRouter();
  const toast = useToast();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    author: '',
    isPublished: false,
  });
  const [files, setFiles] = useState<File[]>([]);

  const { bgColor, borderColor } = useContext(AppContext);
  const titleColor = useColorModeValue('gray.800', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      let author = form.author.trim();
      if (!author) {
        try {
          const { getAuth } = await import('firebase/auth');
          const u = getAuth().currentUser;
          author = u?.displayName || u?.email || '';
        } catch {
          author = '';
        }
      }
      const imageUrls = await uploadImages(files, 'news');
      await createNews({
        title: form.title.trim(),
        slug: form.slug || generateSlug(form.title),
        summary: form.summary.trim(),
        imageUrls,
        author,
        isPublished: form.isPublished,
        publishDate: new Date().toISOString(),
      });
      toast({ title: 'Berita ditambahkan', status: 'success', duration: 3000 });
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
          Buat Berita
        </Heading>
        <Text color={muted} fontSize="sm" mt={1}>
          Tambahkan berita baru untuk halaman publik.
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
              <FormLabel>Judul</FormLabel>
              <Input
                value={form.title}
                placeholder="cth: Kunjungan Wali Santri"
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

            <FormControl>
              <FormLabel>Ringkasan / Isi</FormLabel>
              <Textarea
                value={form.summary}
                rows={6}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Penulis</FormLabel>
              <Input
                value={form.author}
                placeholder="Nama penulis"
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </FormControl>

            <Checkbox
              isChecked={form.isPublished}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.checked })
              }
              colorScheme="green"
            >
              Publikasikan sekarang
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
                Tambah Berita
              </Button>
            </Flex>
          </VStack>
        </form>
      </Box>
    </VStack>
  );
}
