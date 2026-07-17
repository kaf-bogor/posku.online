'use client';

import { useChat } from '@ai-sdk/react';
import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState, useMemo } from 'react';

function getTextFromParts(
  parts: Array<{ type: string; text?: string }>
): string {
  return parts
    .filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text)
    .join('');
}

export default function ChatBox() {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/chat/data-santri' }),
    []
  );
  const { messages, sendMessage, status, error } = useChat({ transport });

  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'submitted' || status === 'streaming';

  const bubbleBg = useColorModeValue('blue.500', 'blue.400');
  const panelBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const userBubbleBg = useColorModeValue('blue.500', 'blue.400');
  const assistantBubbleBg = useColorModeValue('gray.100', 'gray.700');
  const userTextColor = 'white';
  const assistantTextColor = useColorModeValue('gray.800', 'gray.100');
  const inputBg = useColorModeValue('white', 'gray.700');
  const placeholderColor = useColorModeValue('gray.400', 'gray.400');
  const headerBg = useColorModeValue('blue.600', 'blue.700');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  }

  if (!isOpen) {
    return (
      <Box position="fixed" bottom={6} right={6} zIndex={1000}>
        <IconButton
          aria-label="Buka chat"
          onClick={() => setIsOpen(true)}
          borderRadius="full"
          w={14}
          h={14}
          bg={bubbleBg}
          color="white"
          boxShadow="lg"
          _hover={{ transform: 'scale(1.1)', boxShadow: 'xl' }}
          transition="all 0.2s"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
      </Box>
    );
  }

  return (
    <Box
      position="fixed"
      bottom={6}
      right={6}
      zIndex={1000}
      w={{ base: 'calc(100vw - 32px)', sm: '400px' }}
      maxH="500px"
      bg={panelBg}
      borderRadius="xl"
      boxShadow="2xl"
      border="1px solid"
      borderColor={borderColor}
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {/* Header */}
      <HStack
        px={4}
        py={3}
        bg={headerBg}
        color="white"
        justify="space-between"
        flexShrink={0}
      >
        <Text fontWeight="bold" fontSize="sm">
          Tanya Data Santri
        </Text>
        <IconButton
          aria-label="Tutup chat"
          size="xs"
          variant="ghost"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
          onClick={() => setIsOpen(false)}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          }
        />
      </HStack>

      {/* Messages */}
      <VStack
        ref={scrollRef}
        flex={1}
        overflowY="auto"
        px={4}
        py={3}
        spacing={3}
        align="stretch"
        maxH="350px"
        minH="200px"
      >
        {messages.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text fontSize="sm" color="gray.500">
              Tanyakan apa saja tentang data santri TA 2025/2026
            </Text>
            <Text fontSize="xs" color="gray.400" mt={1}>
              Contoh: &quot;Siapa saja guru di Kuttab Awal 1A?&quot;
            </Text>
          </Box>
        )}
        {messages.map((msg) => {
          const text = getTextFromParts(
            msg.parts as Array<{ type: string; text?: string }>
          );
          if (!text) return null;
          return (
            <Box
              key={msg.id}
              alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
              maxW="85%"
            >
              <Box
                px={3}
                py={2}
                borderRadius="lg"
                bg={msg.role === 'user' ? userBubbleBg : assistantBubbleBg}
                color={msg.role === 'user' ? userTextColor : assistantTextColor}
                fontSize="sm"
                whiteSpace="pre-wrap"
                wordBreak="break-word"
              >
                {text}
              </Box>
            </Box>
          );
        })}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <Box alignSelf="flex-start" maxW="85%">
            <Box
              px={3}
              py={2}
              borderRadius="lg"
              bg={assistantBubbleBg}
              color={assistantTextColor}
              fontSize="sm"
            >
              <Text as="span">Mengetik...</Text>
            </Box>
          </Box>
        )}
        {error && (
          <Box
            px={3}
            py={2}
            borderRadius="lg"
            bg="red.50"
            color="red.600"
            fontSize="xs"
          >
            Error: {error.message}
          </Box>
        )}
      </VStack>

      {/* Input */}
      <Box
        as="form"
        onSubmit={handleSubmit}
        px={3}
        py={3}
        borderTop="1px solid"
        borderColor={borderColor}
        flexShrink={0}
      >
        <HStack>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pertanyaan..."
            size="sm"
            borderRadius="lg"
            bg={inputBg}
            _placeholder={{ color: placeholderColor }}
            focusBorderColor="blue.400"
          />
          <Button
            type="submit"
            size="sm"
            colorScheme="blue"
            borderRadius="lg"
            isLoading={isLoading}
            isDisabled={!input.trim()}
            px={4}
          >
            Kirim
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
