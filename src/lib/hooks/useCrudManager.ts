/* eslint-disable no-console */

import { useToast } from '@chakra-ui/react';
import { getAuth } from 'firebase/auth';
import type { DocumentData } from 'firebase/firestore';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc as firestoreDoc,
  query,
  orderBy,
  arrayUnion,
} from 'firebase/firestore';
import { useState, useEffect, useRef, useCallback } from 'react';

import { db } from '~/lib/firebase';
import type { Activity } from '~/lib/types/donation';

// Placeholder untuk tipe data generik
// Nantinya akan diganti dengan tipe spesifik seperti Donation, News, atau Event
export type ManagedItem = {
  id: string;
  title: string;
  summary: string;
  imageUrls: string[];
};

// Properti yang dibutuhkan oleh hook
export interface UseCrudManagerProps<T extends ManagedItem> {
  collectionName: string;
  blobFolderName: string;
  itemSchema: Omit<T, 'id'>;
}

export function useCrudManager<T extends ManagedItem>({
  collectionName,
  blobFolderName,
  itemSchema,
}: UseCrudManagerProps<T>) {
  const toast = useToast();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<T, 'id'>>(itemSchema);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editForm, setEditForm] = useState<T | null>(null);
  const [editSelectedFiles, setEditSelectedFiles] = useState<File[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const cancelRef = useRef(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, collectionName),
        orderBy('createdAt', 'desc')
      );

      console.log(q, collectionName);
      const querySnapshot = await getDocs(q);
      const itemsData = querySnapshot.docs.map(
        (doc: DocumentData) => ({ ...doc.data(), id: doc.id }) as T
      );
      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: 'Error fetching data',
        description: 'Could not retrieve data from the server.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [collectionName, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleForm = () => setShowForm(!showForm);

  const uploadImagesToServer = async (files: File[], category: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('category', category);
    const response = await fetch('/api/upload/images', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload images');
    }

    const data = await response.json();
    return data.imageUrls;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const imageUrls = await uploadImagesToServer(
        selectedFiles,
        blobFolderName
      );
      const auth = getAuth();
      const user = auth.currentUser;
      const activity: Activity = {
        userId: user?.uid ?? 'anonymous',
        userName: user?.displayName ?? user?.email ?? 'Anonymous',
        type: 'add',
        description: `Menambahkan ${collectionName} ${form.title}`,
        datetime: new Date().toISOString(),
      };

      const docData = {
        ...form,
        imageUrls,
        createdAt: new Date(),
        activities: [activity],
      };
      console.log('Adding item:', docData);
      await addDoc(collection(db, collectionName), docData);
      toast({
        title: 'Success',
        description: 'Item added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setForm(itemSchema);
      setSelectedFiles([]);
      setShowForm(false);
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'There was an error adding the item.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm(null);
    setEditSelectedFiles([]);
  };

  const handleSaveEdit = async (
    e: React.FormEvent<HTMLFormElement | Element>,
    editId: string,
    onSucces: () => void = () => {}
  ) => {
    e.preventDefault();
    if (!editForm || !editId) return;
    setLoading(true);

    console.log('Saving edit for item:', editForm);
    try {
      let { imageUrls } = editForm;

      if (editSelectedFiles.length > 0) {
        const newImageUrls = await uploadImagesToServer(
          editSelectedFiles,
          blobFolderName
        );
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      // Prepare reference and plain object of editForm
      const docRef = firestoreDoc(db, collectionName, editId);
      const { id, ...rest } = editForm;

      // Fetch previous data for diff
      const prevSnap = await getDoc(docRef);
      const prevData = prevSnap.exists()
        ? prevSnap.data()
        : ({} as Record<string, unknown>);

      // Build description of changed fields
      const changedFields: string[] = [];
      Object.entries(rest).forEach(([key, value]) => {
        const prevVal = (prevData as Record<string, unknown>)[key];
        if (JSON.stringify(prevVal) !== JSON.stringify(value)) {
          changedFields.push(`${key}: ${prevVal ?? '–'} → ${value}`);
        }
      });
      const changeDesc =
        changedFields.length > 0
          ? changedFields.join('; ')
          : 'No visible field change';

      // Sanitize editForm into a plain object

      const updatedData = {
        ...JSON.parse(JSON.stringify(rest)), // safely strip any prototype
        imageUrls,
      };

      const user = getAuth().currentUser;
      const activity: Activity = {
        userId: user?.uid ?? 'anonymous',
        userName: user?.displayName ?? user?.email ?? 'Anonymous',
        type: 'edit',
        description: `Mengubah ${collectionName}: ${changeDesc}`,
        datetime: new Date().toISOString(),
      };
      await updateDoc(docRef, {
        ...updatedData,
        activities: arrayUnion(activity),
      });

      toast({
        title: 'Success',
        description: 'Item updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      handleCancelEdit();
      onSucces();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: 'Error',
        description: 'There was an error updating the item.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setLoading(true);
    try {
      const delRef = firestoreDoc(db, collectionName, pendingDeleteId);
      const user = getAuth().currentUser;
      const activity: Activity = {
        userId: user?.uid ?? 'anonymous',
        userName: user?.displayName ?? user?.email ?? 'Anonymous',
        type: 'delete',
        description: `Menghapus item ${pendingDeleteId}`,
        datetime: new Date().toISOString(),
      };
      await updateDoc(delRef, { activities: arrayUnion(activity) });
      await deleteDoc(delRef);
      toast({
        title: 'Success',
        description: 'Item deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setPendingDeleteId(null);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'There was an error deleting the item.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    showForm,
    form,
    setForm,
    selectedFiles,
    setSelectedFiles,
    editForm,
    setEditForm,
    editSelectedFiles,
    setEditSelectedFiles,
    pendingDeleteId,
    cancelRef,
    toggleForm,
    handleAdd,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
  };
}
