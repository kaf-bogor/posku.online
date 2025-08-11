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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useContext, useRef, useState } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

import ManagerForm from '~/app/admin/ManagerForm';
import { AppContext } from '~/lib/context/app';
import { db } from '~/lib/firebase';
import useAuth from '~/lib/hooks/useAuth';
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { NewsItem } from '~/lib/types/news';

export default function NewsAdminPage() {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { user } = useAuth();

  const {
    items: news,
    loading,
    showForm,
    toggleForm,
    form,
    setForm,
    selectedFiles,
    setSelectedFiles,
    editForm,
    setEditForm,
    setEditSelectedFiles,
    handleAdd,
    handleSaveEdit,
    handleCancelEdit,
  } = useCrudManager<NewsItem>({
    collectionName: 'news',
    blobFolderName: 'news',
    itemSchema: {
      title: '',
      summary: '',
      imageUrls: [],
      publishDate: new Date().toISOString(),
      author: user?.displayName || '',
      isPublished: false,
    },
  });

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
    await updateDoc(doc(db, 'news', deleteId), { isPublished: false });
    setDeleteId(null);
    onClose();
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
            onSubmit={handleAdd}
            onCancel={toggleForm}
            title="Add New News"
          >
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                name="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
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

        {isEditing && (
          <ManagerForm
            formState={editForm}
            onSubmit={(e) => handleSaveEdit(e, editForm!.id)}
            onCancel={handleCancelEdit}
            isEdit
            title="Edit News"
          >
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                name="title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm!, title: e.target.value })
                }
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Summary</FormLabel>
              <Textarea
                name="summary"
                value={editForm.summary}
                onChange={(e) =>
                  setEditForm({ ...editForm!, summary: e.target.value })
                }
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Publish Date</FormLabel>
              <Input
                type="date"
                name="publishDate"
                value={editForm!.publishDate.split('T')[0]}
                onChange={(e) =>
                  setEditForm({
                    ...editForm!,
                    publishDate: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Author</FormLabel>
              <Input
                name="author"
                value={editForm!.author}
                onChange={(e) =>
                  setEditForm({ ...editForm!, author: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={editForm!.isPublished}
                onChange={(e) =>
                  setEditForm({ ...editForm!, isPublished: e.target.checked })
                }
              >
                Published
              </Checkbox>
            </FormControl>

            <FormControl>
              <FormLabel>Additional Images</FormLabel>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  setEditSelectedFiles(Array.from(e.target.files || []))
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
