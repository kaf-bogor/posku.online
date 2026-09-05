'use client';

/* eslint-disable no-nested-ternary */

import { Search2Icon } from '@chakra-ui/icons';
import {
  Box,
  VStack,
  Heading,
  Text,
  HStack,
  Button,
  Spinner,
  Badge,
  Flex,
  Image,
  Icon,
  Divider,
  Input,
  Checkbox,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Select,
  useDisclosure,
  useToast,
  useColorModeValue,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaPlus,
} from 'react-icons/fa';

import ManagerForm from '~/app/admin/ManagerForm';
import { AppContext } from '~/lib/context/app';
import {
  createEvent,
  listEvents,
  updateEvent,
} from '~/lib/services/contentService';
import type { EventItem } from '~/lib/types/event';
import {
  filterEvents,
  getEventStatus,
  type EventStatusFilter,
} from '~/lib/utils/adminEvents';
import { generateSlug } from '~/lib/utils/slug';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function EventsAdminPage() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<EventItem, 'id'>>({
    title: '',
    slug: '',
    summary: '',
    imageUrls: [],
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    location: '',
    isActive: false,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { bgColor, borderColor } = useContext(AppContext);
  const titleColor = useColorModeValue('gray.800', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');

  const reload = async () => {
    setLoading(true);
    try {
      const data = await listEvents();
      setEvents(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const uploadImagesToServer = async (files: File[], category: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('category', category);
    const response = await fetch('/api/upload/images', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload images');
    const data = await response.json();
    return data.imageUrls as string[];
  };

  const filtered = useMemo(
    () => filterEvents(events, query, statusFilter),
    [events, query, statusFilter]
  );

  const activeCount = useMemo(
    () => events.filter((e) => e.isActive).length,
    [events]
  );

  const toggleForm = () => {
    setShowForm((prev) => !prev);
    setForm({
      title: '',
      slug: '',
      summary: '',
      imageUrls: [],
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      location: '',
      isActive: false,
    });
    setSelectedFiles([]);
  };

  const handleSoftDelete = async () => {
    if (!deleteId) return;
    try {
      await updateEvent(deleteId, { isActive: false });
      setEvents((prev) =>
        prev.map((ev) => (ev.id === deleteId ? { ...ev, isActive: false } : ev))
      );
      toast({
        title: 'Acara disembunyikan',
        description: 'Acara tidak lagi tampil di halaman publik.',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Gagal menyimpan.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setDeleteId(null);
      onClose();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = form.slug || generateSlug(form.title);
      const imageUrls = await uploadImagesToServer(selectedFiles, 'events');
      await createEvent({ ...form, slug, imageUrls });
      toast({
        title: 'Acara ditambahkan',
        status: 'success',
        duration: 3000,
      });
      toggleForm();
      reload();
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Gagal menambahkan acara.',
        status: 'error',
        duration: 4000,
      });
    }
  };

  const createForm = (
    <Box
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <ManagerForm
        formState={form}
        onSubmit={handleAdd}
        onCancel={toggleForm}
        title="Buat Acara Baru"
      >
        <Box
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          p={5}
          w="100%"
        >
          <Heading size="sm" mb={4} color={titleColor}>
            Informasi Acara
          </Heading>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Judul Acara</FormLabel>
              <Input
                name="title"
                value={form.title}
                placeholder="cth: Kajian Bulanan Orang Tua"
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

            <FormControl>
              <FormLabel>Slug (otomatis)</FormLabel>
              <Input
                name="slug"
                value={form.slug}
                isReadOnly
                placeholder="url-friendly-slug"
                bg="gray.50"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Deskripsi</FormLabel>
              <ReactQuill
                theme="snow"
                value={form.summary}
                onChange={(value) => setForm({ ...form, summary: value })}
              />
            </FormControl>

            <FormControl isRequired={selectedFiles.length === 0}>
              <FormLabel>Gambar Sampul</FormLabel>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  setSelectedFiles(Array.from(e.target.files || []))
                }
              />
            </FormControl>
          </VStack>
        </Box>

        <Box
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          p={5}
          w="100%"
        >
          <Heading size="sm" mb={4} color={titleColor}>
            Detail & Publikasi
          </Heading>
          <VStack align="stretch" spacing={4}>
            <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
              <FormControl isRequired>
                <FormLabel>Mulai</FormLabel>
                <Input
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Selesai</FormLabel>
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
            </Flex>

            <FormControl isRequired>
              <FormLabel>Lokasi</FormLabel>
              <Input
                name="location"
                value={form.location}
                placeholder="cth: Masjid Jami' At-Taqwa AURI"
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </FormControl>

            <Checkbox
              isChecked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              colorScheme="green"
            >
              Tampilkan di publik
            </Checkbox>
          </VStack>
        </Box>
      </ManagerForm>
    </Box>
  );

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        gap={3}
      >
        <Box>
          <Heading size="lg" color={titleColor}>
            Events
          </Heading>
          <Text color={muted} fontSize="sm" mt={1}>
            Kelola acara & kegiatan. {activeCount} acara aktif dari{' '}
            {events.length} total.
          </Text>
        </Box>
        <Button
          colorScheme="green"
          leftIcon={<FaPlus />}
          onClick={toggleForm}
          alignSelf="flex-start"
        >
          Buat Acara
        </Button>
      </Flex>

      {showForm && createForm}

      <Divider />

      {loading ? (
        <Box textAlign="center" py={16}>
          <Spinner size="xl" color="green.500" thickness="3px" />
          <Text color={muted} mt={4}>
            Memuat acara...
          </Text>
        </Box>
      ) : loadError ? (
        <Box
          textAlign="center"
          py={16}
          bg={bgColor}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Heading size="md" mb={2}>
            Gagal memuat acara
          </Heading>
          <Text color={muted} mb={4}>
            {loadError}
          </Text>
          <Button colorScheme="blue" onClick={reload}>
            Coba Lagi
          </Button>
        </Box>
      ) : (
        <>
          {/* Toolbar */}
          <Flex direction={{ base: 'column', md: 'row' }} gap={3}>
            <InputGroup maxW={{ base: '100%', md: '320px' }}>
              <InputLeftElement pointerEvents="none">
                <Search2Icon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Cari acara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
            <Select
              maxW={{ base: '100%', md: '200px' }}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as EventStatusFilter)
              }
            >
              <option value="all">Semua status</option>
              <option value="upcoming">Akan datang</option>
              <option value="active">Berlangsung</option>
              <option value="past">Selesai</option>
              <option value="hidden">Disembunyikan</option>
            </Select>
          </Flex>

          {filtered.length === 0 ? (
            <Box
              textAlign="center"
              py={16}
              bg={bgColor}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Heading size="md" mb={2}>
                Tidak ada acara
              </Heading>
              <Text color={muted} mb={4}>
                {query || statusFilter !== 'all'
                  ? 'Tidak ada acara yang cocok dengan pencarian/filter.'
                  : 'Belum ada acara. Buat acara pertama Anda.'}
              </Text>
              {!query && statusFilter === 'all' && (
                <Button colorScheme="green" onClick={toggleForm}>
                  Buat Acara
                </Button>
              )}
            </Box>
          ) : (
            <VStack align="stretch" spacing={4}>
              {filtered.map((event) => {
                const status = getEventStatus(event);
                const thumb = event.imageUrls?.[0];
                return (
                  <Box
                    key={event.id}
                    bg={bgColor}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    shadow="sm"
                    overflow="hidden"
                  >
                    <Flex
                      direction={{ base: 'column', md: 'row' }}
                      align="stretch"
                    >
                      {thumb ? (
                        <Box
                          flexShrink={0}
                          w={{ base: '100%', md: '200px' }}
                          h={{ base: '160px', md: 'auto' }}
                          bg="gray.100"
                          position="relative"
                        >
                          <Image
                            src={thumb}
                            alt={event.title}
                            objectFit="cover"
                            w="100%"
                            h="100%"
                          />
                        </Box>
                      ) : null}
                      <VStack
                        align="stretch"
                        spacing={2}
                        p={5}
                        flex={1}
                        justify="center"
                      >
                        <HStack spacing={2} wrap="wrap">
                          <Heading size="sm" color={titleColor} flex={1}>
                            {event.title}
                          </Heading>
                          <Badge colorScheme={status.color} variant="subtle">
                            {status.label}
                          </Badge>
                        </HStack>
                        <HStack
                          spacing={4}
                          color={muted}
                          fontSize="sm"
                          wrap="wrap"
                        >
                          <HStack spacing={1}>
                            <Icon as={FaCalendarAlt} />
                            <Text>
                              {format(
                                new Date(event.startDate),
                                'dd MMM yyyy',
                                {
                                  locale: localeID,
                                }
                              )}
                              {new Date(event.endDate).getTime() !==
                                new Date(event.startDate).getTime() &&
                                ` – ${format(
                                  new Date(event.endDate),
                                  'dd MMM yyyy',
                                  {
                                    locale: localeID,
                                  }
                                )}`}
                            </Text>
                          </HStack>
                          {event.location ? (
                            <HStack spacing={1}>
                              <Icon as={FaMapMarkerAlt} />
                              <Text noOfLines={1}>{event.location}</Text>
                            </HStack>
                          ) : null}
                        </HStack>
                      </VStack>
                      <Flex
                        direction={{ base: 'row', md: 'column' }}
                        gap={2}
                        p={4}
                        align={{ base: 'center', md: 'flex-end' }}
                        justify={{ base: 'flex-end', md: 'center' }}
                      >
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<FaEdit />}
                          onClick={() =>
                            router.push(`/admin/event/${event.id}/edit`)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          leftIcon={<FaTrash />}
                          onClick={() => {
                            setDeleteId(event.id);
                            onOpen();
                          }}
                        >
                          Sembunyikan
                        </Button>
                      </Flex>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          )}
        </>
      )}

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
              Sembunyikan Acara
            </AlertDialogHeader>
            <AlertDialogBody>
              Acara ini akan disembunyikan dari halaman publik. Anda masih bisa
              mengubahnya kembali kapan saja.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Batal
              </Button>
              <Button colorScheme="red" onClick={handleSoftDelete} ml={3}>
                Sembunyikan
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
}
