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
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

import ManagerForm from '~/app/admin/ManagerForm';
import { AppContext } from '~/lib/context/app';
import { db } from '~/lib/firebase';
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { EventItem } from '~/lib/types/event';

export default function EventsAdminPage() {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    items: events,
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
  } = useCrudManager<EventItem>({
    collectionName: 'events',
    blobFolderName: 'events',
    itemSchema: {
      title: '',
      summary: '',
      imageUrls: [],
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      location: '',
      isActive: false,
    },
  });

  const { bgColor, textColor } = useContext(AppContext);

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const titleColor = useColorModeValue('gray.800', 'white');

  if (loading) {
    return (
      <HStack justify="center" py={20}>
        <Spinner />
        <Text>Loading events...</Text>
      </HStack>
    );
  }

  const isEditing = !!editForm;

  const handleSoftDelete = async () => {
    if (!deleteId) return;
    await updateDoc(doc(db, 'events', deleteId), { isActive: false });
    setDeleteId(null);
    onClose();
  };

  return (
    <>
      <VStack align="stretch" spacing={4} bg={bgColor}>
        <Button alignSelf="start" colorScheme="green" onClick={toggleForm}>
          Add Event
        </Button>

        {showForm && !isEditing && (
          <ManagerForm
            formState={form}
            onSubmit={handleAdd}
            onCancel={toggleForm}
            title="Add New Event"
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

            <FormControl isRequired>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                name="startDate"
                value={form.startDate.split('T')[0]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    startDate: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                name="endDate"
                value={form.endDate.split('T')[0]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    endDate: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              >
                Active
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
            title="Edit Event"
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
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                name="startDate"
                value={editForm.startDate.split('T')[0]}
                onChange={(e) =>
                  setEditForm({
                    ...editForm!,
                    startDate: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                name="endDate"
                value={editForm.endDate.split('T')[0]}
                onChange={(e) =>
                  setEditForm({
                    ...editForm!,
                    endDate: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm!, location: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={editForm.isActive}
                onChange={(e) =>
                  setEditForm({ ...editForm!, isActive: e.target.checked })
                }
              >
                Active
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

        {events.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text color={textColor}>Belum ada data event.</Text>
          </Box>
        ) : (
          events.map((event) => (
            <Box
              key={event.id}
              p={4}
              bg={bgColor}
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={3}>
                <Heading size="md" color={titleColor}>
                  {event.title}
                </Heading>
                <Text color={textColor} noOfLines={2}>
                  {event.summary}
                </Text>
                <HStack fontSize="sm" color={textColor} spacing={3}>
                  <HStack spacing={1}>
                    <FaCalendarAlt />
                    <Text>
                      {format(new Date(event.startDate), 'dd MMM yyyy')} –{' '}
                      {format(new Date(event.endDate), 'dd MMM yyyy')}
                    </Text>
                  </HStack>
                  <HStack spacing={1}>
                    <FaMapMarkerAlt />
                    <Text>{event.location}</Text>
                  </HStack>
                  {event.isActive && <Badge colorScheme="purple">Active</Badge>}
                </HStack>
                <HStack>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => router.push(`/admin/event/${event.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => {
                      setDeleteId(event.id);
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
              Delete Event
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
