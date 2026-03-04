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
  Textarea,
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
import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';
import { db } from '~/lib/firebase';
import useAuth from '~/lib/hooks/useAuth';

interface AttendanceEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  createdBy: string;
}

interface FormState {
  title: string;
  description: string;
  date: string;
}

const COLLECTION = 'attendanceEvents';
const emptyForm: FormState = { title: '', description: '', date: '' };

export default function AdminKehadiranPage() {
  const { user } = useAuth('admin');

  const [items, setItems] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { bgColor, textColor, borderColor } = useContext(AppContext);
  const titleColor = useColorModeValue('gray.800', 'white');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const data: AttendanceEvent[] = snap.docs.map((d) => {
        const raw = d.data() as Record<string, unknown>;
        const dateVal = raw.date as { toDate?: () => Date } | undefined;
        return {
          id: d.id,
          title: (raw.title as string) ?? '',
          description: (raw.description as string) ?? '',
          date: dateVal?.toDate
            ? dateVal.toDate().toISOString()
            : new Date(0).toISOString(),
          createdBy: (raw.createdBy as string) ?? '',
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
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;

    if (editId) {
      await updateDoc(doc(db, COLLECTION, editId), {
        title: form.title.trim(),
        description: form.description.trim(),
        date: new Date(form.date),
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, COLLECTION), {
        title: form.title.trim(),
        description: form.description.trim(),
        date: new Date(form.date),
        createdAt: serverTimestamp(),
        createdBy: user?.email ?? '',
      });
    }

    resetForm();
    fetchItems();
  };

  const handleEdit = (item: AttendanceEvent) => {
    setEditId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      date: item.date ? item.date.slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await deleteDoc(doc(db, COLLECTION, deleteId));
    setDeleteId(null);
    onClose();
    fetchItems();
  };

  if (loading) {
    return (
      <HStack justify="center" py={20}>
        <Spinner />
        <Text>Loading attendance events...</Text>
      </HStack>
    );
  }

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
          {showForm ? 'Cancel' : 'Add Event'}
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
                {editId ? 'Edit Event Kehadiran' : 'Tambah Event Kehadiran'}
              </Heading>
              <VStack align="stretch" spacing={3}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="datetime-local"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </FormControl>

                <HStack spacing={2} mt={4}>
                  <Button colorScheme={editId ? 'blue' : 'green'} type="submit">
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
            <Text color={textColor}>Belum ada event kehadiran.</Text>
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
                <Heading size="md" color={titleColor}>
                  {item.title}
                </Heading>
                {item.description && (
                  <Text color={textColor} noOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <HStack fontSize="sm" color={textColor} spacing={3}>
                  <HStack spacing={1}>
                    <FaCalendarAlt />
                    <Text>
                      {format(new Date(item.date), 'dd MMM yyyy HH:mm')}
                    </Text>
                  </HStack>
                  <Text>By {item.createdBy}</Text>
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
              Delete Event Kehadiran
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This will permanently delete the event and cannot be
              undone.
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
