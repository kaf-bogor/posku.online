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
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaPlus,
} from 'react-icons/fa';

import NavButton from '~/lib/components/NavButton';
import { AppContext } from '~/lib/context/app';
import { listEvents, updateEvent } from '~/lib/services/contentService';
import type { EventItem } from '~/lib/types/event';
import {
  filterEvents,
  getEventStatus,
  type EventStatusFilter,
} from '~/lib/utils/adminEvents';

type StatusFilter = EventStatusFilter;

export default function EventsAdminPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

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

  const filtered = useMemo(
    () => filterEvents(events, query, statusFilter),
    [events, query, statusFilter]
  );

  const activeCount = useMemo(
    () => events.filter((e) => e.isActive).length,
    [events]
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await updateEvent(deleteId, { is_delete: true });
      setEvents((prev) => prev.filter((ev) => ev.id !== deleteId));
      toast({
        title: 'Acara dihapus',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Gagal menghapus.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setDeleteId(null);
      onClose();
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
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
        <NavButton
          colorScheme="green"
          leftIcon={<FaPlus />}
          alignSelf="flex-start"
          href="/admin/events/add"
        >
          Buat Acara
        </NavButton>
      </Flex>

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
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
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
                <NavButton colorScheme="green" href="/admin/events/add">
                  Buat Acara
                </NavButton>
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
                        <NavButton
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<FaEdit />}
                          href={`/admin/event/${event.id}/edit`}
                        >
                          Edit
                        </NavButton>
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
                          Hapus
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
              Hapus Acara
            </AlertDialogHeader>
            <AlertDialogBody>
              Yakin ingin menghapus acara ini? (soft delete, data tetap
              tersimpan)
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Batal
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Hapus
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
}
