'use client';

/* eslint-disable no-nested-ternary */

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
  useColorModeValue,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';
import useAuth from '~/lib/hooks/useAuth';
import {
  deleteAttendanceEvent,
  listAttendanceEvents,
} from '~/lib/services/attendanceService';

interface AttendanceEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  createdBy: string;
}

const isPastEvent = (date: string) => new Date(date).getTime() < Date.now();

export default function AdminKehadiranPage() {
  useAuth('admin');
  const router = useRouter();
  const toast = useToast();

  const [items, setItems] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { bgColor, textColor, borderColor } = useContext(AppContext);
  const titleColor = useColorModeValue('gray.800', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAttendanceEvents();
      const mapped: AttendanceEvent[] = data.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        date: d.date,
        createdBy: d.createdBy,
      }));
      setItems(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await deleteAttendanceEvent(deleteId);
    setDeleteId(null);
    onClose();
    fetchItems();
    toast({ title: 'Event dihapus', status: 'success', duration: 3000 });
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
            Kehadiran
          </Heading>
          <Text color={muted} fontSize="sm" mt={1}>
            Kelola event kehadiran ({items.length} total).
          </Text>
        </Box>
        <Button
          colorScheme="green"
          leftIcon={<FaPlus />}
          onClick={() => router.push('/admin/kehadiran/add')}
          alignSelf="flex-start"
        >
          Buat Event
        </Button>
      </Flex>

      {loading ? (
        <Box textAlign="center" py={16}>
          <Spinner size="xl" color="green.500" thickness="3px" />
        </Box>
      ) : items.length === 0 ? (
        <Box
          textAlign="center"
          py={16}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
        >
          <Heading size="md" mb={2}>
            Belum ada event kehadiran
          </Heading>
          <Text color={muted} mb={4}>
            Buat event pertama untuk pencatatan kehadiran.
          </Text>
          <Button
            colorScheme="green"
            onClick={() => router.push('/admin/kehadiran/add')}
          >
            Buat Event
          </Button>
        </Box>
      ) : (
        <VStack align="stretch" spacing={4}>
          {items.map((item) => (
            <Box
              key={item.id}
              p={4}
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="xl"
              shadow="sm"
            >
              <VStack align="stretch" spacing={3}>
                <HStack spacing={2}>
                  <Heading size="sm" color={titleColor} flex={1}>
                    {item.title}
                  </Heading>
                  {isPastEvent(item.date) && (
                    <Badge colorScheme="gray">Sudah berlalu</Badge>
                  )}
                </HStack>
                {item.description && (
                  <Text color={textColor} noOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <HStack fontSize="sm" color={muted} spacing={3}>
                  <HStack spacing={1}>
                    <FaCalendarAlt />
                    <Text>
                      {format(new Date(item.date), 'dd MMM yyyy, HH:mm', {
                        locale: localeID,
                      })}
                    </Text>
                  </HStack>
                  <Text>By {item.createdBy || '-'}</Text>
                </HStack>
                <HStack>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    leftIcon={<FaEdit />}
                    isDisabled={isPastEvent(item.date)}
                    onClick={() =>
                      router.push(`/admin/kehadiran/${item.id}/edit`)
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
                      setDeleteId(item.id);
                      onOpen();
                    }}
                  >
                    Hapus
                  </Button>
                </HStack>
              </VStack>
            </Box>
          ))}
        </VStack>
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
              Hapus Event Kehadiran
            </AlertDialogHeader>
            <AlertDialogBody>
              Yakin ingin menghapus event ini? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Batal
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Hapus
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
}
