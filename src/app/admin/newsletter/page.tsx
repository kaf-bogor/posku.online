'use client';

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
  useDisclosure,
  useToast,
  useColorModeValue,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FaEnvelopeOpenText, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

import NavButton from '~/lib/components/NavButton';
import { AppContext } from '~/lib/context/app';
import useAuth from '~/lib/hooks/useAuth';
import {
  deleteNewsletter,
  listNewsletters,
} from '~/lib/services/contentService';
import type { NewsletterItem } from '~/lib/types/newsletter';
import {
  filterNewsletters,
  isNewsletterPublished,
} from '~/lib/utils/adminNewsletter';
import { resolveStorageUrl } from '~/lib/utils/newsletter';

export default function AdminNewsletterPage() {
  useAuth('admin');
  const toast = useToast();

  const [items, setItems] = useState<NewsletterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { bgColor, borderColor } = useContext(AppContext);
  const titleColor = useColorModeValue('gray.800', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listNewsletters();
      const mapped: NewsletterItem[] = data.map((raw) => ({
        id: raw.id as string,
        order: raw.order,
        title: raw.title,
        image_url: raw.image_url,
        document_url: raw.document_url ?? null,
      }));
      setItems(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = useMemo(
    () => filterNewsletters(items, query),
    [items, query]
  );

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await deleteNewsletter(deleteId);
    setDeleteId(null);
    onClose();
    fetchItems();
    toast({ title: 'Newsletter dihapus', status: 'success', duration: 3000 });
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
            Newsletter
          </Heading>
          <Text color={muted} fontSize="sm" mt={1}>
            Buat dan kelola newsletter ({items.length} total).
          </Text>
        </Box>
        <NavButton
          colorScheme="green"
          leftIcon={<FaPlus />}
          alignSelf="flex-start"
          href="/admin/newsletter/add"
        >
          Buat Newsletter
        </NavButton>
      </Flex>

      <Divider />

      {loading ? (
        <Box textAlign="center" py={16}>
          <Spinner size="xl" color="green.500" thickness="3px" />
          <Text color={muted} mt={4}>
            Memuat newsletter...
          </Text>
        </Box>
      ) : (
        <>
          <InputGroup maxW={{ base: '100%', md: '320px' }}>
            <InputLeftElement pointerEvents="none">
              <Search2Icon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Cari newsletter..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>

          {filtered.length === 0 ? (
            <Box
              textAlign="center"
              py={16}
              bg={bgColor}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Icon
                as={FaEnvelopeOpenText}
                boxSize={8}
                color="gray.300"
                mb={3}
              />
              <Heading size="md" mb={2}>
                {query ? 'Tidak ditemukan' : 'Belum ada newsletter'}
              </Heading>
              <Text color={muted} mb={4}>
                {query
                  ? 'Tidak ada newsletter yang cocok dengan pencarian.'
                  : 'Buat newsletter pertama Anda untuk halaman publik.'}
              </Text>
              {!query && (
                <NavButton colorScheme="green" href="/admin/newsletter/add">
                  Buat Newsletter
                </NavButton>
              )}
            </Box>
          ) : (
            <VStack align="stretch" spacing={4}>
              {filtered.map((item) => {
                const published = isNewsletterPublished(item);
                const docUrl = item.document_url
                  ? resolveStorageUrl(item.document_url)
                  : '';
                return (
                  <Box
                    key={item.id}
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="xl"
                    shadow="sm"
                    p={4}
                  >
                    <Flex
                      direction={{ base: 'column', md: 'row' }}
                      align={{ base: 'stretch', md: 'center' }}
                      gap={4}
                    >
                      {item.image_url ? (
                        <Image
                          src={resolveStorageUrl(item.image_url)}
                          alt={item.title}
                          boxSize={{ base: '100%', md: '64px' }}
                          h={{ base: '160px', md: '64px' }}
                          objectFit="contain"
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="md"
                          bg="white"
                          p={1}
                          flexShrink={0}
                        />
                      ) : null}

                      <VStack align="start" spacing={1} flex={1} minW={0}>
                        <Badge colorScheme={published ? 'green' : 'gray'}>
                          {published ? 'Terbit' : 'Draft'}
                        </Badge>
                        <Heading size="sm" color={titleColor}>
                          {item.title}
                        </Heading>
                        {item.document_url ? (
                          <Text
                            as="a"
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            fontSize="sm"
                            color="blue.500"
                            wordBreak="break-all"
                            _hover={{ textDecoration: 'underline' }}
                          >
                            {docUrl}
                          </Text>
                        ) : (
                          <Text fontSize="sm" color={muted}>
                            Belum ada link dokumen.
                          </Text>
                        )}
                      </VStack>

                      <HStack
                        spacing={2}
                        justify={{ base: 'flex-start', md: 'flex-end' }}
                      >
                        <NavButton
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<FaEdit />}
                          href={`/admin/newsletter/${item.id}/edit`}
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
                          Hapus
                        </Button>
                      </HStack>
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
              Hapus Newsletter
            </AlertDialogHeader>
            <AlertDialogBody>
              Yakin ingin menghapus newsletter ini? Tindakan ini tidak dapat
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
