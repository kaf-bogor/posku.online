'use client';

/* eslint-disable no-nested-ternary, sonarjs/cognitive-complexity */

import { Search2Icon } from '@chakra-ui/icons';
import {
  Box,
  VStack,
  Heading,
  Text,
  HStack,
  Button,
  Spinner,
  Badge,
  Flex,
  Image,
  Icon,
  Divider,
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
  useDisclosure,
  useToast,
  useColorModeValue,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FaEnvelopeOpenText, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';
import useAuth from '~/lib/hooks/useAuth';
import {
  createNewsletter,
  deleteNewsletter,
  listNewsletters,
} from '~/lib/services/contentService';
import { uploadImage } from '~/lib/services/uploadService';
import type { NewsletterItem } from '~/lib/types/newsletter';
import {
  filterNewsletters,
  isNewsletterPublished,
  MONTHS_ID,
  monthToOrder,
  monthToTitle,
} from '~/lib/utils/adminNewsletter';
import { resolveStorageUrl } from '~/lib/utils/newsletter';

interface FormState {
  month: number;
  year: number;
  image_url: string;
  document_url: string;
}

const makeEmptyForm = (): FormState => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    image_url: '',
    document_url: '',
  };
};

export default function AdminNewsletterPage() {
  useAuth('admin');
  const toast = useToast();
  const router = useRouter();

  const [items, setItems] = useState<NewsletterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(makeEmptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { bgColor, borderColor } = useContext(AppContext);
  const titleColor = useColorModeValue('gray.800', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listNewsletters();
      const mapped: NewsletterItem[] = data.map((raw) => ({
        id: raw.id as string,
        order: raw.order,
        title: raw.title,
        image_url: raw.image_url,
        document_url: raw.document_url ?? null,
      }));
      setItems(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = useMemo(
    () => filterNewsletters(items, query),
    [items, query]
  );

  const resetForm = () => {
    setForm(makeEmptyForm());
    setImageFile(null);
    setImageTab('upload');
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleForm = () => {
    if (showForm) resetForm();
    else {
      setForm(makeEmptyForm());
      setImageFile(null);
      setImageTab('upload');
      setShowForm(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.month || !form.year) return;

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

      await createNewsletter(payload);
      toast({
        title: 'Newsletter ditambahkan',
        status: 'success',
        duration: 3000,
      });

      resetForm();
      fetchItems();
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

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await deleteNewsletter(deleteId);
    setDeleteId(null);
    onClose();
    fetchItems();
    toast({ title: 'Newsletter dihapus', status: 'success', duration: 3000 });
  };

  const previewSrc = imageFile
    ? URL.createObjectURL(imageFile)
    : form.image_url
      ? resolveStorageUrl(form.image_url)
      : '';

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const list: number[] = [];
    for (let y = currentYear + 1; y >= currentYear - 6; y -= 1) list.push(y);
    return list;
  }, []);

  const formPanel = (
    <Box
      p={5}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      shadow="sm"
    >
      <form onSubmit={handleSubmit}>
        <Heading size="md" mb={1} color={titleColor}>
          Buat Newsletter
        </Heading>
        <Text color={muted} fontSize="sm" mb={5}>
          Pilih bulan terbit untuk newsletter baru.
        </Text>

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
            <Button variant="outline" onClick={resetForm} isDisabled={saving}>
              Batal
            </Button>
            <Button
              colorScheme="green"
              type="submit"
              isLoading={saving}
              loadingText="Menyimpan..."
            >
              Tambah Newsletter
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        gap={3}
      >
        <Box>
          <Heading size="lg" color={titleColor}>
            Newsletter
          </Heading>
          <Text color={muted} fontSize="sm" mt={1}>
            Buat dan kelola newsletter ({items.length} total).
          </Text>
        </Box>
        <Button
          colorScheme="green"
          leftIcon={<FaPlus />}
          onClick={toggleForm}
          alignSelf="flex-start"
        >
          {showForm ? 'Tutup Form' : 'Buat Newsletter'}
        </Button>
      </Flex>

      {showForm && formPanel}

      <Divider />

      {loading ? (
        <Box textAlign="center" py={16}>
          <Spinner size="xl" color="green.500" thickness="3px" />
          <Text color={muted} mt={4}>
            Memuat newsletter...
          </Text>
        </Box>
      ) : (
        <>
          <InputGroup maxW={{ base: '100%', md: '320px' }}>
            <InputLeftElement pointerEvents="none">
              <Search2Icon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Cari newsletter..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>

          {filtered.length === 0 ? (
            <Box
              textAlign="center"
              py={16}
              bg={bgColor}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Icon
                as={FaEnvelopeOpenText}
                boxSize={8}
                color="gray.300"
                mb={3}
              />
              <Heading size="md" mb={2}>
                {query ? 'Tidak ditemukan' : 'Belum ada newsletter'}
              </Heading>
              <Text color={muted} mb={4}>
                {query
                  ? 'Tidak ada newsletter yang cocok dengan pencarian.'
                  : 'Buat newsletter pertama Anda untuk halaman publik.'}
              </Text>
              {!query && (
                <Button colorScheme="green" onClick={toggleForm}>
                  Buat Newsletter
                </Button>
              )}
            </Box>
          ) : (
            <VStack align="stretch" spacing={4}>
              {filtered.map((item) => {
                const published = isNewsletterPublished(item);
                const docUrl = item.document_url
                  ? resolveStorageUrl(item.document_url)
                  : '';
                return (
                  <Box
                    key={item.id}
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="xl"
                    shadow="sm"
                    p={4}
                  >
                    <Flex
                      direction={{ base: 'column', md: 'row' }}
                      align={{ base: 'stretch', md: 'center' }}
                      gap={4}
                    >
                      {item.image_url ? (
                        <Image
                          src={resolveStorageUrl(item.image_url)}
                          alt={item.title}
                          boxSize={{ base: '100%', md: '64px' }}
                          h={{ base: '160px', md: '64px' }}
                          objectFit="contain"
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="md"
                          bg="white"
                          p={1}
                          flexShrink={0}
                        />
                      ) : null}

                      <VStack align="start" spacing={1} flex={1} minW={0}>
                        <HStack spacing={2}>
                          <Badge colorScheme={published ? 'green' : 'gray'}>
                            {published ? 'Terbit' : 'Draft'}
                          </Badge>
                        </HStack>
                        <Heading size="sm" color={titleColor}>
                          {item.title}
                        </Heading>
                        {item.document_url ? (
                          <Text
                            as="a"
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            fontSize="sm"
                            color="blue.500"
                            wordBreak="break-all"
                            _hover={{ textDecoration: 'underline' }}
                          >
                            {docUrl}
                          </Text>
                        ) : (
                          <Text fontSize="sm" color={muted}>
                            Belum ada link dokumen.
                          </Text>
                        )}
                      </VStack>

                      <HStack
                        spacing={2}
                        justify={{ base: 'flex-start', md: 'flex-end' }}
                      >
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<FaEdit />}
                          onClick={() =>
                            router.push(`/admin/newsletter/${item.id}/edit`)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          leftIcon={<FaTrash />}
                          onClick={() => {
                            setDeleteId(item.id);
                            onOpen();
                          }}
                        >
                          Hapus
                        </Button>
                      </HStack>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          )}
        </>
      )}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          setDeleteId(null);
          onClose();
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Hapus Newsletter
            </AlertDialogHeader>
            <AlertDialogBody>
              Yakin ingin menghapus newsletter ini? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Batal
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Hapus
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
}
