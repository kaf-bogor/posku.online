'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  HStack,
  Button,
  Spinner,
  useColorModeValue,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Image,
  useToast,
} from '@chakra-ui/react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { AppContext } from '~/lib/context/app';
import { db } from '~/lib/firebase';
import useAuth from '~/lib/hooks/useAuth';
import type { NewsletterItem } from '~/lib/types/newsletter';
import { resolveStorageUrl } from '~/lib/utils/newsletter';

interface FormState {
  title: string;
  order: string;
  image_url: string;
  document_url: string;
}

const COLLECTION = 'newsletters';
const emptyForm: FormState = {
  title: '',
  order: '',
  image_url: '',
  document_url: '',
};

export default function AdminNewsletterPage() {
  const { user } = useAuth('admin');
  const toast = useToast();

  const [items, setItems] = useState<NewsletterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { bgColor, textColor, borderColor } = useContext(AppContext);
  const titleColor = useColorModeValue('gray.800', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      const data: NewsletterItem[] = snap.docs.map((d) => {
        const raw = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          order: Number(raw.order ?? 0),
          title: (raw.title as string) ?? '',
          image_url: (raw.image_url as string) ?? '',
          document_url: (raw.document_url as string) ?? null,
        };
      });
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setImageFile(null);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('category', COLLECTION);
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
        await updateDoc(doc(db, COLLECTION, editId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        toast({
          title: 'Newsletter diperbarui',
          status: 'success',
          duration: 3000,
        });
      } else {
        await addDoc(collection(db, COLLECTION), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user?.email ?? '',
        });
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
        description: (err as Error).message,
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
    await deleteDoc(doc(db, COLLECTION, deleteId));
    setDeleteId(null);
    onClose();
    fetchItems();
    toast({ title: 'Newsletter dihapus', status: 'success', duration: 3000 });
  };

  if (loading) {
    return (
      <HStack justify="center" py={20}>
        <Spinner />
        <Text>Loading newsletters...</Text>
      </HStack>
    );
  }

  const previewSrc = imageFile
    ? URL.createObjectURL(imageFile)
    : resolveStorageUrl(form.image_url);

  return (
    <>
      <VStack align="stretch" spacing={4}>
        <Button
          alignSelf="start"
          colorScheme="green"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
        >
          {showForm ? 'Cancel' : 'Add Newsletter'}
        </Button>

        {showForm && (
          <Box
            p={4}
            mb={8}
            borderWidth="1px"
            borderRadius="md"
            borderColor={borderColor}
          >
            <form onSubmit={handleSubmit}>
              <Heading size="sm" mb={4}>
                {editId ? 'Edit Newsletter' : 'Tambah Newsletter'}
              </Heading>
              <VStack align="stretch" spacing={3}>
                <FormControl isRequired>
                  <FormLabel>Judul</FormLabel>
                  <Input
                    value={form.title}
                    placeholder="cth: Juli 2024"
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Urutan</FormLabel>
                  <Input
                    type="number"
                    value={form.order}
                    placeholder="1"
                    onChange={(e) =>
                      setForm({ ...form, order: e.target.value })
                    }
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
                    placeholder="2024%2Fjuli%2Fjuli_thumb.png?alt=media"
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
                      boxSize="80px"
                      objectFit="contain"
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="md"
                      bg="white"
                      p={1}
                    />
                  </Box>
                )}

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

                <HStack spacing={2} mt={4}>
                  <Button
                    colorScheme={editId ? 'blue' : 'green'}
                    type="submit"
                    isLoading={saving}
                  >
                    {editId ? 'Save Changes' : 'Add Item'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </form>
          </Box>
        )}

        {items.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text color={textColor}>Belum ada newsletter.</Text>
          </Box>
        ) : (
          items.map((item) => (
            <Box
              key={item.id}
              p={4}
              bg={bgColor}
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={3}>
                <HStack spacing={4} align="start">
                  {item.image_url && (
                    <Image
                      src={resolveStorageUrl(item.image_url)}
                      alt={item.title}
                      boxSize="60px"
                      objectFit="contain"
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="md"
                      bg="white"
                      p={1}
                    />
                  )}
                  <Box minW={0} flex={1}>
                    <Heading size="md" color={titleColor}>
                      #{item.order} · {item.title}
                    </Heading>
                    <Text color={muted} fontSize="sm" noOfLines={1} mt={1}>
                      {item.document_url
                        ? resolveStorageUrl(item.document_url)
                        : 'Tidak terbit'}
                    </Text>
                  </Box>
                </HStack>
                <HStack>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => {
                      setDeleteId(item.id);
                      onOpen();
                    }}
                  >
                    Delete
                  </Button>
                </HStack>
              </VStack>
            </Box>
          ))
        )}
      </VStack>

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
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
