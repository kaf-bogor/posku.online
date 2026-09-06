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
import { useContext, useEffect, useRef, useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

import NavButton from '~/lib/components/NavButton';
import { AppContext } from '~/lib/context/app';
import useAuth from '~/lib/hooks/useAuth';
import { listNews, updateNews } from '~/lib/services/contentService';
import type { NewsItem } from '~/lib/types/news';

export default function NewsAdminPage() {
  useAuth('admin');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { bgColor, borderColor } = useContext(AppContext);
  const titleColor = useColorModeValue('gray.800', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    listNews()
      .then(setNews)
      .finally(() => setLoading(false));
  }, []);

  const handleSoftDelete = async () => {
    if (!deleteId) return;
    try {
      await updateNews(deleteId, { isPublished: false });
      setNews((prev) =>
        prev.map((n) => (n.id === deleteId ? { ...n, isPublished: false } : n))
      );
      toast({
        title: 'Berita disembunyikan',
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
            Berita
          </Heading>
          <Text color={muted} fontSize="sm" mt={1}>
            Kelola berita ({news.length} total).
          </Text>
        </Box>
        <NavButton
          colorScheme="green"
          leftIcon={<FaPlus />}
          alignSelf="flex-start"
          href="/admin/news/add"
        >
          Buat Berita
        </NavButton>
      </Flex>

      {loading ? (
        <Box textAlign="center" py={16}>
          <Spinner size="xl" color="green.500" thickness="3px" />
        </Box>
      ) : news.length === 0 ? (
        <Box
          textAlign="center"
          py={16}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
        >
          <Heading size="md" mb={2}>
            Belum ada berita
          </Heading>
          <Text color={muted} mb={4}>
            Buat berita pertama Anda.
          </Text>
          <NavButton colorScheme="green" href="/admin/news/add">
            Buat Berita
          </NavButton>
        </Box>
      ) : (
        <VStack align="stretch" spacing={4}>
          {news.map((item) => (
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
                  {item.isPublished && (
                    <Badge colorScheme="green">Published</Badge>
                  )}
                </HStack>
                <Text color={muted} fontSize="sm" noOfLines={2}>
                  {item.summary}
                </Text>
                <HStack fontSize="sm" color={muted} spacing={3}>
                  {item.publishDate && (
                    <Text>
                      {format(new Date(item.publishDate), 'dd MMM yyyy')}
                    </Text>
                  )}
                  {item.author && <Text>By {item.author}</Text>}
                </HStack>
                <HStack>
                  <NavButton
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    leftIcon={<FaEdit />}
                    href={`/admin/news/${item.id}/edit`}
                  >
                    Edit
                  </NavButton>
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
                    Sembunyikan
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
              Sembunyikan Berita
            </AlertDialogHeader>
            <AlertDialogBody>
              Berita ini akan disembunyikan dari halaman publik. Anda masih bisa
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
