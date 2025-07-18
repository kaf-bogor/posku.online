'use client';

import { AddIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Heading,
  VStack,
  Spinner,
  HStack,
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
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';

import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { DonationPage } from '~/lib/types/donation';

import DonationCard from './components/DonationCard';
import ManagerForm from './ManagerForm';

const initialDonationState: Omit<DonationPage, 'id'> = {
  title: '',
  summary: '',
  imageUrls: [],
  target: 0,
  link: '',
  organizer: {
    avatar: '',
    name: '',
    tagline: '',
  },
  donors: [],
};

export default function DonationManager() {
  const {
    items: donations,
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
  } = useCrudManager<DonationPage>({
    collectionName: 'donations',
    blobFolderName: 'donation',
    itemSchema: initialDonationState,
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleNumberChange = (value: string) => {
    setForm({ ...form, target: Number(value) });
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (editForm) setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setEditSelectedFiles(Array.from(e.target.files));
  };

  const handleEditNumberChange = (value: string) => {
    if (editForm) setEditForm({ ...editForm, target: Number(value) });
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
              Delete Donation Page
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
          <Heading size="md">Donation Management</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="teal"
            size="sm"
            onClick={toggleForm}
          >
            {showForm ? 'Hide Form' : 'Add Donation Page'}
          </Button>
        </HStack>

        <Collapse in={showForm} animateOpacity>
          <ManagerForm
            title="Add New Donation Page"
            formState={form}
            onFormChange={
              handleFormChange as (
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => void
            }
            onFileChange={
              handleFileChange as (
                e: React.ChangeEvent<HTMLInputElement>
              ) => void
            }
            selectedFiles={selectedFiles}
            onSubmit={handleAdd}
            onCancel={toggleForm}
          >
            <FormControl isRequired>
              <FormLabel>Target (Rp)</FormLabel>
              <NumberInput
                value={form.target}
                min={0}
                onChange={handleNumberChange}
              >
                <NumberInputField name="target" />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Link</FormLabel>
              <Input
                name="link"
                value={form.link}
                onChange={handleFormChange}
              />
            </FormControl>
          </ManagerForm>
        </Collapse>

        <Heading size="sm" mb={2}>
          Donasi yang Sedang Berjalan
        </Heading>
        {loading ? (
          <Spinner />
        ) : (
          <VStack align="stretch" spacing={3}>
            {donations.map((d) => (
              <Box key={d.id} p={3} bg="white" borderRadius="md" boxShadow="sm">
                {editId === d.id ? (
                  <ManagerForm
                    isEdit
                    title={`Edit: ${d.title}`}
                    formState={editForm}
                    onFormChange={
                      handleEditFormChange as (
                        e: React.ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >
                      ) => void
                    }
                    onFileChange={
                      handleEditFileChange as (
                        e: React.ChangeEvent<HTMLInputElement>
                      ) => void
                    }
                    selectedFiles={editSelectedFiles}
                    onSubmit={handleSaveEdit}
                    onCancel={handleCancelEdit}
                  >
                    <FormControl isRequired>
                      <FormLabel>Target (Rp)</FormLabel>
                      <NumberInput
                        value={editForm?.target}
                        min={0}
                        onChange={handleEditNumberChange}
                      >
                        <NumberInputField name="target" />
                      </NumberInput>
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Link</FormLabel>
                      <Input
                        name="link"
                        value={editForm?.link}
                        onChange={handleEditFormChange}
                      />
                    </FormControl>
                  </ManagerForm>
                ) : (
                  <DonationCard
                    donation={d}
                    currentAmount={200000000}
                    onEdit={() => handleEdit(d)}
                    onDelete={() => handleDelete(d.id)}
                    actionEnabled={false}
                  />
                )}
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </>
  );
}
