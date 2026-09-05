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
  FormControl,
  FormLabel,
  FormHelperText,
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
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FaEnvelopeOpenText,
  FaEdit,
  FaTrash,
  FaPlus,
  FaExternalLinkAlt,
} from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';
import useAuth from '~/lib/hooks/useAuth';
import {
  createNewsletter,
  deleteNewsletter,
  listNewsletters,
  updateNewsletter,
} from '~/lib/services/contentService';
import type { NewsletterItem } from '~/lib/types/newsletter';
import { resolveStorageUrl } from '~/lib/utils/newsletter';

interface FormState {
  title: string;
  order: string;
  image_url: string;
  document_url: string;
}

const emptyForm: FormState = {
  title: '',
  order: '',
  image_url: '',
  document_url: '',
};

export default function AdminNewsletterPage() {
  useAuth('admin');
  const toast = useToast();

  const [items, setItems] = useState<NewsletterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.title.toLowerCase().includes(q));
  }, [items, query]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setImageFile(null);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleForm = () => {
    if (showForm) resetForm();
    else {
      setEditId(null);
      setForm(emptyForm);
      setImageFile(null);
      setShowForm(true);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('category', 'newsletters');
    const res = await fetch('/api/upload/images', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload gambar gagal');
    const data = await res.json();
    return data.imageUrls[0] as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.order.trim()) return;

    setSaving(true);
    try {
      let imageUrl = form.image_url.trim();
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = {
        title: form.title.trim(),
        order: Number(form.order),
        image_url: imageUrl,
        document_url: form.document_url.trim() || null,
      };

      if (editId) {
        await updateNewsletter(editId, payload);
        toast({
          title: 'Newsletter diperbarui',
          status: 'success',
          duration: 3000,
        });
      } else {
        await createNewsletter(payload);
        toast({
          title: 'Newsletter ditambahkan',
          status: 'success',
          duration: 3000,
        });
      }

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

  const handleEdit = (item: NewsletterItem) => {
    setEditId(item.id);
    setForm({
      title: item.title,
      order: String(item.order),
      image_url: item.image_url,
      document_url: item.document_url ?? '',
    });
    setImageFile(null);
    setShowForm(true);
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
          {editId ? 'Edit Newsletter' : 'Buat Newsletter'}
        </Heading>
        <Text color={muted} fontSize="sm" mb={5}>
          {editId
            ? 'Perbarui detail newsletter ini.'
            : 'Tambahkan newsletter baru untuk halaman publik.'}
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
            <VStack align="stretch" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Judul</FormLabel>
                <Input
                  value={form.title}
                  placeholder="cth: Juli 2024"
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Urutan</FormLabel>
                <Input
                  type="number"
                  value={form.order}
                  placeholder="1"
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                />
                <FormHelperText>
                  Semakin besar angka, semakin tampil di depan.
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Gambar (upload)</FormLabel>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setImageFile(file);
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Image URL / path</FormLabel>
                <Input
                  value={form.image_url}
                  placeholder="2024/juli/juli_thumb.png"
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                />
                <FormHelperText>
                  Path blob (tanpa domain) atau URL lengkap. Diisi manual jika
                  tidak upload.
                </FormHelperText>
              </FormControl>

              {previewSrc && (
                <Box>
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
            </VStack>
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
              <FormHelperText>Kosongkan jika belum terbit.</FormHelperText>
            </FormControl>
          </Box>

          <Flex justify="flex-end" gap={3}>
            <Button variant="outline" onClick={resetForm} isDisabled={saving}>
              Batal
            </Button>
            <Button
              colorScheme={editId ? 'blue' : 'green'}
              type="submit"
              isLoading={saving}
              loadingText="Menyimpan..."
            >
              {editId ? 'Simpan Perubahan' : 'Tambah Newsletter'}
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
                const published = Boolean(item.document_url);
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
                          <Badge colorScheme="gray" variant="subtle">
                            #{item.order}
                          </Badge>
                          <Badge colorScheme={published ? 'green' : 'gray'}>
                            {published ? 'Terbit' : 'Draft'}
                          </Badge>
                        </HStack>
                        <Heading size="sm" color={titleColor}>
                          {item.title}
                        </Heading>
                        {item.document_url && (
                          <Text
                            as="span"
                            fontSize="sm"
                            color={muted}
                            noOfLines={1}
                            wordBreak="break-all"
                          >
                            {resolveStorageUrl(item.document_url)}
                          </Text>
                        )}
                      </VStack>

                      <HStack
                        spacing={2}
                        justify={{ base: 'flex-start', md: 'flex-end' }}
                      >
                        {item.document_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            as="a"
                            href={resolveStorageUrl(item.document_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            leftIcon={<FaExternalLinkAlt />}
                          >
                            Lihat
                          </Button>
                        )}
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<FaEdit />}
                          onClick={() => handleEdit(item)}
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
