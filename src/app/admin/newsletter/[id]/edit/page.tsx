'use client';

/* eslint-disable no-nested-ternary, sonarjs/cognitive-complexity */

import {
  Box,
  VStack,
  Heading,
  Text,
  HStack,
  Button,
  Spinner,
  Flex,
  Image,
  Input,
  Select,
  FormControl,
  FormLabel,
  FormHelperText,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';
import useAuth from '~/lib/hooks/useAuth';
import {
  listNewsletters,
  updateNewsletter,
} from '~/lib/services/contentService';
import { uploadImage } from '~/lib/services/uploadService';
import {
  MONTHS_ID,
  monthToOrder,
  monthToTitle,
  parseNewsletterMonth,
} from '~/lib/utils/adminNewsletter';
import { resolveStorageUrl } from '~/lib/utils/newsletter';

interface FormState {
  month: number;
  year: number;
  image_url: string;
  document_url: string;
}

const ADMIN_PATH = '/admin/newsletter';

export default function EditNewsletterPage() {
  useAuth('admin');
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { bgColor, borderColor } = useContext(AppContext);
  const titleColor = useColorModeValue('gray.800', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await listNewsletters();
      const item = data
        .map((raw) => ({
          id: raw.id as string,
          order: raw.order,
          title: raw.title,
          image_url: raw.image_url,
          document_url: raw.document_url ?? null,
        }))
        .find((news) => news.id === id);
      if (!item) {
        toast({
          title: 'Tidak ditemukan',
          description: 'Newsletter tidak ditemukan.',
          status: 'error',
          duration: 4000,
        });
        router.push(ADMIN_PATH);
        return;
      }
      const parsed = parseNewsletterMonth(item.title);
      const now = new Date();
      setForm({
        month: parsed?.month ?? now.getMonth() + 1,
        year: parsed?.year ?? now.getFullYear(),
        image_url: item.image_url,
        document_url: item.document_url ?? '',
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
      let imageUrl = form.image_url.trim();
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = {
        title: monthToTitle(form.month, form.year),
        order: monthToOrder(form.month, form.year),
        image_url: imageUrl,
        document_url: form.document_url.trim() || null,
      };

      await updateNewsletter(id, payload);
      toast({
        title: 'Newsletter diperbarui',
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

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const list: number[] = [];
    for (let y = currentYear + 1; y >= currentYear - 6; y -= 1) list.push(y);
    return list;
  }, []);

  if (loading || !form) {
    return (
      <Box textAlign="center" py={16}>
        <Spinner size="xl" color="green.500" thickness="3px" />
        <Text color={muted} mt={4}>
          Memuat newsletter...
        </Text>
      </Box>
    );
  }

  const previewSrc = imageFile
    ? URL.createObjectURL(imageFile)
    : form.image_url
      ? resolveStorageUrl(form.image_url)
      : '';

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" align="center">
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
            Edit Newsletter
          </Heading>
          <Text color={muted} fontSize="sm" mt={1}>
            Perbarui newsletter{' '}
            {form ? `“${monthToTitle(form.month, form.year)}”` : ''}.
          </Text>
        </Box>
      </HStack>

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
            <Box
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              p={5}
              w="100%"
            >
              <Heading size="sm" mb={4} color={titleColor}>
                Informasi
              </Heading>
              <FormControl isRequired>
                <FormLabel>Bulan / Tahun Terbit</FormLabel>
                <Flex direction={{ base: 'column', md: 'row' }} gap={3}>
                  <Select
                    value={form.month}
                    onChange={(e) =>
                      setForm({ ...form, month: Number(e.target.value) })
                    }
                    maxW={{ base: '100%', md: '220px' }}
                  >
                    {MONTHS_ID.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={form.year}
                    onChange={(e) =>
                      setForm({ ...form, year: Number(e.target.value) })
                    }
                    maxW={{ base: '100%', md: '160px' }}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </Select>
                </Flex>
                <FormHelperText>
                  Judul otomatis: <b>{monthToTitle(form.month, form.year)}</b>
                </FormHelperText>
              </FormControl>
            </Box>

            <Box
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              p={5}
              w="100%"
            >
              <Heading size="sm" mb={4} color={titleColor}>
                Gambar
              </Heading>
              <Tabs
                variant="soft-rounded"
                colorScheme="green"
                index={imageTab === 'upload' ? 0 : 1}
                onChange={(idx) => {
                  const next = idx === 0 ? 'upload' : 'url';
                  setImageTab(next);
                  if (next === 'upload') {
                    setForm({ ...form, image_url: '' });
                  } else {
                    setImageFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }
                }}
              >
                <TabList mb={4}>
                  <Tab>Upload File</Tab>
                  <Tab>Paste URL</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0}>
                    <FormControl>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setImageFile(file);
                          if (file) setForm({ ...form, image_url: '' });
                        }}
                      />
                      <FormHelperText>
                        Pilih berkas gambar untuk diunggah (utama).
                      </FormHelperText>
                    </FormControl>
                  </TabPanel>
                  <TabPanel px={0}>
                    <FormControl>
                      <Input
                        value={form.image_url}
                        placeholder="https://files.rifkifauzi.id/... atau path 2024/juli/x.png"
                        onChange={(e) =>
                          setForm({ ...form, image_url: e.target.value })
                        }
                      />
                      <FormHelperText>
                        Tempel URL gambar yang sudah ada.
                      </FormHelperText>
                    </FormControl>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {previewSrc && (
                <Box mt={3}>
                  <Image
                    src={previewSrc}
                    alt="Preview"
                    boxSize="96px"
                    objectFit="contain"
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    bg="white"
                    p={1}
                  />
                </Box>
              )}
            </Box>

            <Box
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              p={5}
              w="100%"
            >
              <Heading size="sm" mb={4} color={titleColor}>
                Publikasi
              </Heading>
              <FormControl>
                <FormLabel>Link dokumen</FormLabel>
                <Input
                  value={form.document_url}
                  placeholder="https://bit.ly/..."
                  onChange={(e) =>
                    setForm({ ...form, document_url: e.target.value })
                  }
                />
                <FormHelperText>
                  Kosongkan jika belum terbit (status Draft).
                </FormHelperText>
              </FormControl>
            </Box>

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
