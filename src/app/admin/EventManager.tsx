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
  useToast,
} from '@chakra-ui/react';

import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { EventItem } from '~/lib/types/event';

import ManagerForm from './ManagerForm';
import SimpleCarousel from './SimpleCarousel';

const initialEventState: Omit<EventItem, 'id'> = {
  title: '',
  summary: '', // summary will be used for description
  imageUrls: [],
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  location: '',
  isActive: true,
};

export default function EventManager() {
  const toast = useToast();
  const {
    items: events,
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
  } = useCrudManager<EventItem>({
    collectionName: 'events',
    blobFolderName: 'event',
    itemSchema: initialEventState,
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

  const validateDates = (startDate: string, endDate: string) => {
    if (new Date(startDate) > new Date(endDate)) {
      toast({
        status: 'error',
        title: 'End date must be after or equal to start date',
      });
      return false;
    }
    return true;
  };

  const handleAddEvent = (e: React.FormEvent) => {
    if (!validateDates(form.startDate, form.endDate)) return;
    handleAdd(e);
  };

  const handleSaveEditEvent = (e: React.FormEvent) => {
    if (!editForm || !validateDates(editForm.startDate, editForm.endDate))
      return;
    handleSaveEdit(e);
  };

  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (now < start) return { label: 'Upcoming', color: 'blue' };
    if (now >= start && now <= end) return { label: 'Current', color: 'green' };
    return { label: 'Past', color: 'gray' };
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
              Delete Event
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
          <Heading size="md">Event Management</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="teal"
            size="sm"
            onClick={toggleForm}
          >
            {showForm ? 'Hide Form' : 'Add Event'}
          </Button>
        </HStack>

        <Collapse in={showForm} animateOpacity>
          <ManagerForm
            title="Add New Event"
            formState={form}
            onFormChange={handleFormChange}
            onFileChange={handleFileChange}
            selectedFiles={selectedFiles}
            onSubmit={handleAddEvent}
            onCancel={toggleForm}
          >
            <HStack>
              <FormControl isRequired>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleFormChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleFormChange}
                />
              </FormControl>
            </HStack>
            <FormControl isRequired>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={form.location}
                onChange={handleFormChange}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="isActive-add" mb="0">
                Active
              </FormLabel>
              <Switch
                id="isActive-add"
                name="isActive"
                isChecked={form.isActive}
                onChange={handleFormChange}
              />
            </FormControl>
          </ManagerForm>
        </Collapse>

        <Heading size="sm" mb={2}>
          Existing Events
        </Heading>
        {loading ? (
          <Spinner />
        ) : (
          <VStack align="stretch" spacing={3}>
            {events.map((item) => (
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
                    onSubmit={handleSaveEditEvent}
                    onCancel={handleCancelEdit}
                  >
                    <HStack>
                      <FormControl isRequired>
                        <FormLabel>Start Date</FormLabel>
                        <Input
                          type="date"
                          name="startDate"
                          value={editForm?.startDate}
                          onChange={handleEditFormChange}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>End Date</FormLabel>
                        <Input
                          type="date"
                          name="endDate"
                          value={editForm?.endDate}
                          onChange={handleEditFormChange}
                        />
                      </FormControl>
                    </HStack>
                    <FormControl isRequired>
                      <FormLabel>Location</FormLabel>
                      <Input
                        name="location"
                        value={editForm?.location}
                        onChange={handleEditFormChange}
                      />
                    </FormControl>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor={`isActive-edit-${item.id}`} mb="0">
                        Active
                      </FormLabel>
                      <Switch
                        id={`isActive-edit-${item.id}`}
                        name="isActive"
                        isChecked={editForm?.isActive}
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
                          colorScheme={
                            getEventStatus(item.startDate, item.endDate).color
                          }
                        >
                          {getEventStatus(item.startDate, item.endDate).label}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(item.startDate).toLocaleDateString()} -{' '}
                        {new Date(item.endDate).toLocaleDateString()} at{' '}
                        {item.location}
                      </Text>
                      <Text fontSize="sm" noOfLines={2} mt={1}>
                        {item.summary}
                      </Text>
                      <Box w="200px" h="120px" mt={2}>
                        <SimpleCarousel images={item.imageUrls} />
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
