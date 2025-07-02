'use client';

import { EditIcon, DeleteIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Spinner,
  Input,
  HStack,
  useToast,
  FormLabel,
  FormControl,
  Textarea,
  NumberInput,
  NumberInputField,
  IconButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc as firestoreDoc,
} from 'firebase/firestore';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

import { db } from '~/lib/firebase';
import type { DonationPage } from '~/lib/types/donation';

import SimpleCarousel from './SimpleCarousel';

const BOX_SHADOW = '0 2px 8px rgba(0,0,0,0.1)';
const PREVIEW_ALT = 'Preview';
const EDIT_PREVIEW_ALT = 'Edit Preview';
const EDIT_NEW_PREVIEW_ALT = 'Edit New Preview';

export default function DonationManager() {
  const toast = useToast();
  const [donations, setDonations] = useState<DonationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<DonationPage, 'id'>>({
    title: '',
    summary: '',
    imageUrls: [],
    target: 0,
    link: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<DonationPage, 'id'> | null>(
    null
  );
  const [editSelectedFiles, setEditSelectedFiles] = useState<File[]>([]);

  const fetchDonations = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'donationPages'));
    setDonations(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<DonationPage, 'id'>),
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle multiple file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Handle file selection for edit
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEditSelectedFiles(Array.from(e.target.files));
    }
  };

  // Helper to upload files to Firebase Storage
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import(
      'firebase/storage'
    );
    const storage = getStorage();
    return Promise.all(
      files.map(async (file) => {
        const fileRef = ref(
          storage,
          `donation-images/${Date.now()}-${file.name}`
        );
        await uploadBytes(fileRef, file);
        return getDownloadURL(fileRef);
      })
    );
  };

  const handleNumberChange = (value: string) => {
    setForm({ ...form, target: Number(value) });
  };

  const handleAdd = async () => {
    if (
      !form.title ||
      !form.summary ||
      selectedFiles.length === 0 ||
      !form.link
    ) {
      toast({
        status: 'warning',
        title: 'Please fill all fields and upload images',
      });
      return;
    }
    let imageUrls: string[] = [];
    try {
      imageUrls = await uploadImages(selectedFiles);
    } catch {
      toast({ status: 'error', title: 'Image upload failed' });
      return;
    }
    await addDoc(collection(db, 'donationPages'), { ...form, imageUrls });
    setForm({ title: '', summary: '', imageUrls: [], target: 0, link: '' });
    setSelectedFiles([]);
    fetchDonations();
    toast({ status: 'success', title: 'Donation page added' });
  };

  const handleEdit = (donation: DonationPage) => {
    setEditId(donation.id);
    const { id, ...editFields } = donation;
    setEditForm(editFields);
    setEditSelectedFiles([]);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditNumberChange = (value: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, target: Number(value) });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editForm) return;
    let imageUrls = editForm.imageUrls || [];
    if (editSelectedFiles.length > 0) {
      try {
        const uploaded = await uploadImages(editSelectedFiles);
        imageUrls = [...imageUrls, ...uploaded];
      } catch {
        toast({ status: 'error', title: 'Image upload failed' });
        return;
      }
    }
    await updateDoc(firestoreDoc(db, 'donationPages', id), {
      ...editForm,
      imageUrls,
    });
    setEditId(null);
    setEditForm(null);
    setEditSelectedFiles([]);
    fetchDonations();
    toast({ status: 'success', title: 'Donation page updated' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditForm(null);
  };

  // State for delete confirmation modal
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    await deleteDoc(firestoreDoc(db, 'donationPages', pendingDeleteId));
    fetchDonations();
    toast({ status: 'info', title: 'Donation page deleted' });
    setPendingDeleteId(null);
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
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
              Are you sure you want to delete this donation page? This action
              cannot be undone.
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
        <Heading size="sm" mb={2}>
          Add New Donation Page
        </Heading>
        <VStack align="stretch" spacing={2} mb={6}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input name="title" value={form.title} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Summary</FormLabel>
            <Textarea
              name="summary"
              value={form.summary}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Images</FormLabel>
            <Input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            {selectedFiles.length > 0 && (
              <Box mt={2} mb={2} display="flex" gap={2}>
                {selectedFiles.map((file) => (
                  <Image
                    key={file.name + file.size + file.lastModified}
                    src={URL.createObjectURL(file)}
                    alt={`${PREVIEW_ALT}`}
                    width={100}
                    height={70}
                    style={{
                      maxWidth: '100px',
                      maxHeight: '70px',
                      borderRadius: 8,
                      boxShadow: BOX_SHADOW,
                      objectFit: 'cover',
                    }}
                  />
                ))}
              </Box>
            )}
          </FormControl>
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
            <Input name="link" value={form.link} onChange={handleChange} />
          </FormControl>
          <Button colorScheme="green" onClick={handleAdd}>
            Add Donation Page
          </Button>
        </VStack>
        <Heading size="sm" mb={2}>
          Existing Donation Pages
        </Heading>
        {loading ? (
          <Spinner />
        ) : (
          <VStack align="stretch" spacing={3}>
            {donations.map((d) => (
              <Box key={d.id} p={3} bg="white" borderRadius="md" boxShadow="sm">
                {editId === d.id && editForm ? (
                  <VStack align="stretch" spacing={1}>
                    <Input
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                    />
                    <Textarea
                      name="summary"
                      value={editForm.summary}
                      onChange={handleEditChange}
                    />
                    <FormLabel>Images</FormLabel>
                    <Input
                      type="file"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={handleEditFileChange}
                    />
                    {editForm.imageUrls && editForm.imageUrls.length > 0 && (
                      <Box mt={2} mb={2} display="flex" gap={2}>
                        {editForm.imageUrls.map((url) => (
                          <Image
                            key={url}
                            src={url}
                            alt={EDIT_PREVIEW_ALT}
                            width={100}
                            height={70}
                            style={{
                              maxWidth: '100px',
                              maxHeight: '70px',
                              borderRadius: 8,
                              boxShadow: BOX_SHADOW,
                              objectFit: 'cover',
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    {editSelectedFiles.length > 0 && (
                      <Box mt={2} mb={2} display="flex" gap={2}>
                        {editSelectedFiles.map((file) => (
                          <Image
                            key={file.name + file.size + file.lastModified}
                            src={URL.createObjectURL(file)}
                            alt={EDIT_NEW_PREVIEW_ALT}
                            width={100}
                            height={70}
                            style={{
                              maxWidth: '100px',
                              maxHeight: '70px',
                              borderRadius: 8,
                              boxShadow: BOX_SHADOW,
                              objectFit: 'cover',
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    <NumberInput
                      value={editForm.target}
                      min={0}
                      onChange={handleEditNumberChange}
                    >
                      <NumberInputField name="target" />
                    </NumberInput>
                    <Input
                      name="link"
                      value={editForm.link}
                      onChange={handleEditChange}
                    />
                    <HStack>
                      <IconButton
                        aria-label="Save"
                        icon={<CheckIcon />}
                        colorScheme="green"
                        size="sm"
                        onClick={() => handleSaveEdit(d.id)}
                      />
                      <IconButton
                        aria-label="Cancel"
                        icon={<CloseIcon />}
                        size="sm"
                        onClick={handleCancelEdit}
                      />
                    </HStack>
                  </VStack>
                ) : (
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Heading size="xs">{d.title}</Heading>
                      <Text fontSize="sm">{d.summary}</Text>
                      <Text fontSize="xs" color="gray.500">
                        Target: Rp {d.target.toLocaleString('id-ID')}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Link: {d.link}
                      </Text>
                      {/* Carousel for images */}
                      {d.imageUrls && d.imageUrls.length > 0 && (
                        <Box mt={2} mb={2}>
                          <SimpleCarousel images={d.imageUrls} />
                        </Box>
                      )}
                    </Box>
                    <HStack>
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size="sm"
                        onClick={() => handleEdit(d)}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(d.id)}
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
