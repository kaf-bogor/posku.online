'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaBell } from 'react-icons/fa';

export default function AdminPushPage() {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('/');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to send');
      toast({
        title: 'Notifikasi terkirim',
        description: `Terkirim ke ${data.sent} perangkat${data.failed ? `, ${data.failed} gagal` : ''}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setTitle('');
      setMessage('');
      setUrl('/');
    } catch (error) {
      toast({
        title: 'Gagal mengirim',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <VStack align="stretch" spacing={6} maxW="480px">
      <Box>
        <Heading size="md" mb={1}>
          Kirim Push Notification
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Pesan akan dikirim ke semua pengguna yang telah mengaktifkan notifikasi.
        </Text>
      </Box>

      <VStack as="form" onSubmit={handleSend} align="stretch" spacing={4}>
        <FormControl isRequired>
          <FormLabel>Judul</FormLabel>
          <Input
            placeholder="Judul notifikasi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Pesan</FormLabel>
          <Textarea
            placeholder="Isi pesan notifikasi"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </FormControl>

        <FormControl>
          <FormLabel>URL Tujuan</FormLabel>
          <Input
            placeholder="/"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          leftIcon={<FaBell />}
          isLoading={isSending}
          loadingText="Mengirim..."
          alignSelf="flex-start"
        >
          Kirim Notifikasi
        </Button>
      </VStack>
    </VStack>
  );
}
