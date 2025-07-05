'use client';

import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Spinner,
  HStack,
  IconButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Collapse,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Badge,
} from '@chakra-ui/react';

import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { NewsItem } from '~/lib/types/news';

import ManagerForm from './ManagerForm';
import SimpleCarousel from './SimpleCarousel';

const initialNewsState: Omit<NewsItem, 'id'> = {
  title: '',
  summary: '', // summary will be used for content
  imageUrls: [],
  publishDate: new Date().toISOString().split('T')[0],
  author: '',
  isPublished: false,
};

export default function NewsManager() {
  const {
    items: newsItems,
    loading,
    showForm,
    form,
    setForm,
    selectedFiles,
    setSelectedFiles,
    editId,
    editForm,
    setEditForm,
    editSelectedFiles,
    setEditSelectedFiles,
    pendingDeleteId,
    cancelRef,
    toggleForm,
    handleAdd,
    handleEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
  } = useCrudManager<NewsItem>({
    collectionName: 'news',
    blobFolderName: 'news',
    itemSchema: initialNewsState,
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setForm({
      ...form,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editForm) return;
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setEditForm({
      ...editForm,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setEditSelectedFiles(Array.from(e.target.files));
  };

  return (
    <>
      <AlertDialog
        isOpen={!!pendingDeleteId}
        leastDestructiveRef={cancelRef}
        onClose={cancelDelete}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete News Item
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={cancelDelete}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">News Management</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="teal"
            size="sm"
            onClick={toggleForm}
          >
            {showForm ? 'Hide Form' : 'Add News Item'}
          </Button>
        </HStack>

        <Collapse in={showForm} animateOpacity>
          <ManagerForm
            title="Add New News Item"
            formState={form}
            onFormChange={handleFormChange}
            onFileChange={handleFileChange}
            selectedFiles={selectedFiles}
            onSubmit={handleAdd}
            onCancel={toggleForm}
          >
            <FormControl isRequired>
              <FormLabel>Publish Date</FormLabel>
              <Input
                type="date"
                name="publishDate"
                value={form.publishDate}
                onChange={handleFormChange}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Author</FormLabel>
              <Input
                name="author"
                value={form.author}
                onChange={handleFormChange}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="isPublished-add" mb="0">
                Publish
              </FormLabel>
              <Switch
                id="isPublished-add"
                name="isPublished"
                isChecked={form.isPublished}
                onChange={handleFormChange}
              />
            </FormControl>
          </ManagerForm>
        </Collapse>

        <Heading size="sm" mb={2}>
          Existing News
        </Heading>
        {loading ? (
          <Spinner />
        ) : (
          <VStack align="stretch" spacing={3}>
            {newsItems.map((item) => (
              <Box
                key={item.id}
                p={3}
                bg="white"
                borderRadius="md"
                boxShadow="sm"
              >
                {editId === item.id ? (
                  <ManagerForm
                    isEdit
                    title={`Edit: ${item.title}`}
                    formState={editForm}
                    onFormChange={handleEditFormChange}
                    onFileChange={handleEditFileChange}
                    selectedFiles={editSelectedFiles}
                    onSubmit={handleSaveEdit}
                    onCancel={handleCancelEdit}
                  >
                    <FormControl isRequired>
                      <FormLabel>Publish Date</FormLabel>
                      <Input
                        type="date"
                        name="publishDate"
                        value={editForm?.publishDate}
                        onChange={handleEditFormChange}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Author</FormLabel>
                      <Input
                        name="author"
                        value={editForm?.author}
                        onChange={handleEditFormChange}
                      />
                    </FormControl>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor={`isPublished-edit-${item.id}`} mb="0">
                        Publish
                      </FormLabel>
                      <Switch
                        id={`isPublished-edit-${item.id}`}
                        name="isPublished"
                        isChecked={editForm?.isPublished}
                        onChange={handleEditFormChange}
                      />
                    </FormControl>
                  </ManagerForm>
                ) : (
                  <HStack justify="space-between">
                    <Box flex={1}>
                      <HStack>
                        <Heading size="sm">{item.title}</Heading>
                        <Badge
                          colorScheme={item.isPublished ? 'green' : 'yellow'}
                        >
                          {item.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        By {item.author} on{' '}
                        {new Date(item.publishDate).toLocaleDateString()}
                      </Text>
                      <Text fontSize="sm" noOfLines={2} mt={1}>
                        {item.summary}
                      </Text>
                      <Box w="200px" h="120px" mt={2}>
                        <SimpleCarousel imageUrls={item.imageUrls} />
                      </Box>
                    </Box>
                    <HStack>
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        onClick={() => handleEdit(item)}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        onClick={() => handleDelete(item.id)}
                      />
                    </HStack>
                  </HStack>
                )}
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </>
  );
}
