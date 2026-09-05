'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  HStack,
  Button,
  Spinner,
  Badge,
  useColorModeValue,
  Input,
  Textarea,
  Checkbox,
  FormControl,
  FormLabel,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

import ManagerForm from '~/app/admin/ManagerForm';
import { AppContext } from '~/lib/context/app';
import useAuth from '~/lib/hooks/useAuth';
import {
  createNews,
  listNews,
  updateNews,
} from '~/lib/services/contentService';
import { uploadImages } from '~/lib/services/uploadService';
import type { NewsItem } from '~/lib/types/news';
import { generateSlug } from '~/lib/utils/slug';

export default function NewsAdminPage() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { user } = useAuth('admin');

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<NewsItem, 'id'>>({
    title: '',
    slug: '',
    summary: '',
    imageUrls: [],
    publishDate: new Date().toISOString(),
    author: user?.displayName || '',
    isPublished: false,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const editForm: NewsItem | null = null;
  const toggleForm = () => setShowForm((prev) => !prev);

  const reload = async () => {
    const data = await listNews();
    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  const uploadImagesToServer = async (files: File[], category: string) =>
    uploadImages(files, category);

  const { bgColor, textColor } = useContext(AppContext);

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const titleColor = useColorModeValue('gray.800', 'white');

  if (loading) {
    return (
      <HStack justify="center" py={20}>
        <Spinner />
        <Text>Loading news...</Text>
      </HStack>
    );
  }

  const isEditing = !!editForm;

  const handleSoftDelete = async () => {
    if (!deleteId) return;
    try {
      await updateNews(deleteId, { isPublished: false });
      setNews((prev) =>
        prev.map((n) => (n.id === deleteId ? { ...n, isPublished: false } : n))
      );
      toast({
        title: 'Berhasil',
        description: 'Berita disembunyikan dari publik.',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan berita.',
        status: 'error',
        duration: 4000,
      });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = form.slug || generateSlug(form.title);
      const imageUrls = await uploadImagesToServer(selectedFiles, 'news');
      await createNews({ ...form, slug, imageUrls });
      toast({
        title: 'Sukses',
        description: 'Berita berhasil ditambahkan.',
        status: 'success',
        duration: 3000,
      });
      setForm({
        title: '',
        slug: '',
        summary: '',
        imageUrls: [],
        publishDate: new Date().toISOString(),
        author: user?.displayName || '',
        isPublished: false,
      });
      setSelectedFiles([]);
      setShowForm(false);
      reload();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan berita.',
        status: 'error',
        duration: 4000,
      });
    }
  };

  const handleAddNews = async (e: React.FormEvent) => {
    await handleAdd(e);
  };

  return (
    <>
      <VStack align="stretch" spacing={4} bg={bgColor}>
        <Button alignSelf="start" colorScheme="green" onClick={toggleForm}>
          Add News
        </Button>

        {showForm && !isEditing && (
          <ManagerForm
            formState={form}
            onSubmit={handleAddNews}
            onCancel={toggleForm}
            title="Add New News"
          >
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
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

            <FormControl isRequired>
              <FormLabel>Slug (auto-generated)</FormLabel>
              <Input
                name="slug"
                value={form.slug}
                isReadOnly
                placeholder="url-friendly-slug"
                bg="gray.50"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Summary</FormLabel>
              <Textarea
                name="summary"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={form.isPublished}
                onChange={(e) =>
                  setForm({ ...form, isPublished: e.target.checked })
                }
              >
                Published
              </Checkbox>
            </FormControl>

            <FormControl isRequired={selectedFiles.length === 0}>
              <FormLabel>Images</FormLabel>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  setSelectedFiles(Array.from(e.target.files || []))
                }
              />
            </FormControl>
          </ManagerForm>
        )}

        {news.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text color={textColor}>Belum ada berita.</Text>
          </Box>
        ) : (
          news.map((item) => (
            <Box
              key={item.id}
              p={4}
              bg={bgColor}
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={3}>
                <Heading size="md" color={titleColor}>
                  {item.title}
                </Heading>
                <Text color={textColor} noOfLines={2}>
                  {item.summary}
                </Text>
                <HStack fontSize="sm" color={textColor} spacing={3}>
                  <HStack spacing={1}>
                    <FaCalendarAlt />
                    <Text>
                      {format(new Date(item.publishDate), 'dd MMM yyyy')}
                    </Text>
                  </HStack>
                  <Text>By {item.author}</Text>
                  {item.isPublished && (
                    <Badge colorScheme="purple">Published</Badge>
                  )}
                </HStack>
                <HStack>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => router.push(`/admin/news/${item.id}/edit`)}
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
              Delete News
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can restore this later from Firestore but it
              will be hidden from users.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleSoftDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
