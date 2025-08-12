'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  Spinner,
  Divider,
  Textarea,
  Button,
  FormControl,
  FormErrorMessage,
  useColorModeValue,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { useState } from 'react';

import useAuth from '~/lib/hooks/useAuth';
import { useComments } from '~/lib/hooks/useComments';

interface CommentsSectionProps {
  resourceType: string;
  resourceId: string;
}

export default function CommentsSection({
  resourceType,
  resourceId,
}: CommentsSectionProps) {
  const { user, loading: authLoading, login } = useAuth();
  const { comments, loading, error, addComment } = useComments({
    resourceType,
    resourceId,
  });

  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const metaColor = useColorModeValue('gray.600', 'gray.400');

  const onSubmit = async () => {
    setSubmitError(null);
    if (!user) {
      setSubmitError('Anda perlu login untuk berkomentar.');
      return;
    }
    if (!value.trim()) return;

    try {
      setSubmitting(true);
      await addComment({
        userId: user.uid,
        userName: user.displayName || user.email || 'Pengguna',
        userPhotoURL: user.photoURL || undefined,
        comment: value,
      });
      setValue('');
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Gagal menambahkan komentar';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Render blocks to avoid nested ternaries
  const getAuthBlock = () => {
    if (authLoading) {
      return (
        <HStack>
          <Spinner size="sm" />
          <Text>Sedang memuat autentikasi...</Text>
        </HStack>
      );
    }

    if (user) {
      return (
        <VStack align="stretch" spacing={3}>
          <HStack>
            <Avatar
              size="sm"
              name={user.displayName || undefined}
              src={user.photoURL || undefined}
            />
            <Text color={metaColor}>{user.displayName || user.email}</Text>
          </HStack>
          <FormControl isInvalid={!!submitError}>
            <Textarea
              placeholder="Tulis komentar Anda..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={3}
            />
            <FormErrorMessage>{submitError}</FormErrorMessage>
          </FormControl>
          <HStack justify="flex-end">
            <Button
              onClick={onSubmit}
              isLoading={submitting}
              colorScheme="blue"
            >
              Kirim
            </Button>
          </HStack>
        </VStack>
      );
    }

    return (
      <VStack align="stretch" spacing={3}>
        <Text>Login untuk menambahkan komentar.</Text>
        <Button onClick={login} colorScheme="blue" alignSelf="start">
          Login dengan Google
        </Button>
      </VStack>
    );
  };

  const authBlock = getAuthBlock();

  const renderCommentsBlock = () => {
    if (loading) {
      return (
        <HStack>
          <Spinner size="sm" />
          <Text>Memuat komentar...</Text>
        </HStack>
      );
    }

    if (error) {
      return <Text color="red.400">Gagal memuat komentar: {error}</Text>;
    }

    if (comments.length === 0) {
      return <Text color={metaColor}>Belum ada komentar.</Text>;
    }

    return (
      <VStack spacing={3} align="stretch">
        {comments.map((c) => (
          <HStack key={c.id} align="flex-start" spacing={3}>
            <Avatar size="sm" name={c.userName} src={c.userPhotoURL} />
            <VStack spacing={1} align="stretch" flex={1}>
              <HStack justify="space-between">
                <Text fontWeight="medium">{c.userName}</Text>
                <Text fontSize="sm" color={metaColor}>
                  {format(new Date(c.createdAt), 'dd MMM yyyy, HH:mm', {
                    locale: localeID,
                  })}
                </Text>
              </HStack>
              <Text whiteSpace="pre-wrap">{c.comment}</Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    );
  };

  const commentsBlock = renderCommentsBlock();

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Komentar</Heading>

      <Box
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="xl"
        p={4}
      >
        {authBlock}
      </Box>

      <Divider />

      {commentsBlock}
    </VStack>
  );
}
