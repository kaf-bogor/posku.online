'use client';

import { useChat } from '@ai-sdk/react';
import {
  Box,
  Button,
  HStack,
  IconButton,
  Text,
  Textarea,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { TextStreamChatTransport } from 'ai';
import { useRef, useEffect, useState, useMemo } from 'react';
import {
  FiMaximize,
  FiMinimize,
  FiSend,
  FiStopCircle,
  FiX,
  FiMessageSquare,
} from 'react-icons/fi';

import { prepareAssistantMarkdown } from '~/lib/utils/waLink';

import AssistantMarkdown from './AssistantMarkdown';

const spinAnim = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const blinkAnim = keyframes`
  0%, 80%, 100% { opacity: 0.25; }
  40% { opacity: 1; }
`;

const fadeUpAnim = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ----------------------------- helpers ----------------------------- */

function getTextFromParts(
  parts: Array<{ type: string; text?: string }>
): string {
  return parts
    .filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text)
    .join('');
}

/** Tangkap kalimat "N santri ditemukan" dari jawaban untuk ditampilkan sebagai chip. */
function extractResultCount(text: string): string | null {
  const m = text.match(
    /(\d+)\s+(santri|wali santri|wali|guru|kelas|keluarga)\s+ditemukan/i
  );
  if (!m) return null;
  const label = m[2].toLowerCase();
  const labelMap: Record<string, string> = {
    santri: 'santri',
    'wali santri': 'wali santri',
    wali: 'wali santri',
    guru: 'guru',
    kelas: 'kelas',
    keluarga: 'keluarga',
  };
  return `${m[1]} ${labelMap[label] ?? label} ditemukan`;
}

/* ----------------------------- constants ----------------------------- */

const DEFAULT_LOADING_STEPS = [
  'Mencari data terkait...',
  'Mencocokkan dengan santri & wali santri...',
  'Menyusun jawaban...',
];

const SUGGESTIONS = [
  'Siapa saja guru di Kuttab Awal 1A?',
  'Berapa santri kelas Qonuni 2A?',
  'Wali santri yang bisa IT & digital',
];

/* ----------------------------- component ----------------------------- */

export default function DataChatBox({
  title = 'Tanya Data Santri',
  hint = 'Tanyakan apa saja tentang santri, kelas, guru, dan wali santri.',
  placeholder = 'Tanyakan sesuatu tentang data santri…',
  loadingSteps = DEFAULT_LOADING_STEPS,
}: {
  title?: string;
  hint?: string;
  placeholder?: string;
  loadingSteps?: string[];
}) {
  const transport = useMemo(
    () => new TextStreamChatTransport({ api: '/api/chat/data-santri' }),
    []
  );
  const { messages, sendMessage, stop, status, error } = useChat({
    transport,
  });

  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const isPreparing = status === 'submitted';
  const isStreaming = status === 'streaming';
  const isBusy = isPreparing || isStreaming;

  const lastAssistantText = useMemo(() => {
    const lastAssistant = [...messages].findLast((m) => m.role === 'assistant');
    if (!lastAssistant) return '';
    return getTextFromParts(
      lastAssistant.parts as Array<{ type: string; text?: string }>
    );
  }, [messages]);
  const resultCount = isStreaming
    ? null
    : extractResultCount(lastAssistantText);

  // Rotasi status selama menunggu respons pertama.
  useEffect(() => {
    if (!isPreparing) {
      setStepIdx(0);
      return undefined;
    }
    const id = setInterval(
      () => setStepIdx((i) => (i + 1) % loadingSteps.length),
      1700
    );
    return () => clearInterval(id);
  }, [isPreparing, loadingSteps.length]);

  // Auto-scroll ke pesan terbaru.
  useEffect(() => {
    if (isOpen) {
      sentinelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isStreaming, isOpen, isFullscreen]);

  // Focus input saat dibuka.
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isOpen]);

  function handleSubmit() {
    const value = input.trim();
    if (!value || isBusy) return;
    sendMessage({ text: value });
    setInput('');
    requestAnimationFrame(() => {
      if (inputRef.current) inputRef.current.style.height = 'auto';
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function autoGrow() {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  function runSuggestion(text: string) {
    if (isBusy) return;
    sendMessage({ text });
  }

  function handleStop() {
    stop();
  }

  // ---- palet modern navy/slate ----
  const panelBg = useColorModeValue('#ffffff', '#10151f');
  const convBg = useColorModeValue('#f6f8fb', '#0d1118');
  const surfaceBg = useColorModeValue('#ffffff', '#151b27');
  const borderColor = useColorModeValue('gray.200', '#263044');
  const headerText = useColorModeValue('#0f172a', '#f1f5f9');
  const mutedText = useColorModeValue('#64748b', '#94a3b8');
  const accent = useColorModeValue('#2563eb', '#60a5fa');
  const accentHover = useColorModeValue('#1d4ed8', '#3b82f6');
  const userBubbleBg = useColorModeValue('#2563eb', '#2f6fed');
  const assistantBubbleBg = useColorModeValue('#ffffff', '#1a2230');
  const inputBg = useColorModeValue('#ffffff', '#151b27');
  const scrollTrackColor = useColorModeValue('#cbd5e1', '#334155');
  const scrollbarColor = useColorModeValue(
    '#cbd5e1 transparent',
    '#334155 transparent'
  );
  const errorText = useColorModeValue('#b91c1c', '#fca5a5');
  const hoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');

  // Launcher (tombol FAB)
  if (!isOpen) {
    return (
      <Box position="fixed" bottom={5} right={5} zIndex={1200}>
        <IconButton
          aria-label="Buka chat"
          onClick={() => setIsOpen(true)}
          borderRadius="full"
          w={14}
          h={14}
          bg={accent}
          color="white"
          boxShadow="0 10px 30px rgba(37,99,235,0.35)"
          _hover={{ bg: accentHover, transform: 'translateY(-2px)' }}
          _active={{ transform: 'translateY(0)' }}
          transition="all .18s ease"
          icon={<FiMessageSquare size={24} />}
        />
      </Box>
    );
  }

  // Panel ukuran responsif
  const panelSizing = isFullscreen
    ? {
        top: 0,
        bottom: 0,
        left: { base: 0, md: 'auto' },
        right: { base: 0, md: 0 },
        w: { base: '100vw', md: '440px' },
        h: '100dvh',
        borderRadius: { base: 0, md: 0 },
      }
    : {
        bottom: { base: 0, md: 6 },
        right: 0,
        left: { base: 0, md: 'auto' },
        w: { base: '100vw', md: '420px' },
        h: { base: '100dvh', md: 'min(640px, calc(100dvh - 48px))' },
        borderRadius: { base: 0, md: '16px' },
        pb: { base: 'env(safe-area-inset-bottom)', md: 0 },
      };

  return (
    <Box
      position="fixed"
      zIndex={1400}
      bg={panelBg}
      border="1px solid"
      borderColor={borderColor}
      boxShadow={
        isFullscreen || !isOpen ? 'none' : '0 20px 60px rgba(15,23,42,.18)'
      }
      display="flex"
      flexDirection="column"
      overflow="hidden"
      fontFamily="'Inter', var(--chakra-fonts-body), system-ui, sans-serif"
      sx={{
        '@media (max-width: 767px)': {
          borderRadius: '0 !important',
        },
      }}
      {...panelSizing}
    >
      {/* ===== Header ===== */}
      <Box
        px={4}
        py={3}
        borderBottom="1px solid"
        borderColor={borderColor}
        bg={surfaceBg}
        flexShrink={0}
      >
        <HStack justify="space-between" align="center" spacing={3}>
          <HStack spacing={2.5} minW={0}>
            <Box
              w={8}
              h={8}
              borderRadius="10px"
              bg={accent}
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <FiMessageSquare size={16} />
            </Box>
            <Box minW={0}>
              <Text
                fontSize="14px"
                fontWeight={700}
                color={headerText}
                lineHeight="1.2"
                noOfLines={1}
              >
                {title}
              </Text>
              <HStack spacing={1.5} mt={0.5}>
                <Box
                  w={1.5}
                  h={1.5}
                  borderRadius="full"
                  bg={isBusy ? '#f59e0b' : '#22c55e'}
                />
                <Text fontSize="11px" color={mutedText} noOfLines={1}>
                  {isBusy ? 'Memproses…' : 'Siap membantu'}
                </Text>
              </HStack>
            </Box>
          </HStack>

          <HStack spacing={0.5}>
            <IconButton
              aria-label={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
              variant="ghost"
              size="sm"
              color={mutedText}
              _hover={{ bg: hoverBg, color: headerText }}
              onClick={() => setIsFullscreen((v) => !v)}
              icon={isFullscreen ? <FiMinimize /> : <FiMaximize />}
            />
            <IconButton
              aria-label="Tutup chat"
              variant="ghost"
              size="sm"
              color={mutedText}
              _hover={{ bg: hoverBg, color: headerText }}
              onClick={() => {
                setIsOpen(false);
                setIsFullscreen(false);
              }}
              icon={<FiX />}
            />
          </HStack>
        </HStack>
      </Box>

      {/* ===== Conversation ===== */}
      <Box
        ref={scrollRef}
        flex={1}
        overflowY="auto"
        px={3}
        py={4}
        bg={convBg}
        sx={{
          scrollbarWidth: 'thin',
          scrollbarColor,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': {
            bg: scrollTrackColor,
            borderRadius: '999px',
          },
        }}
      >
        {messages.length === 0 && (
          <Box textAlign="left" px={1}>
            <VStack align="start" spacing={2}>
              <Text
                fontSize="12px"
                fontWeight={600}
                color={accent}
                letterSpacing="0.08em"
                textTransform="uppercase"
              >
                Asisten Data POSKU
              </Text>
              <Text
                fontSize="16px"
                fontWeight={700}
                color={headerText}
                lineHeight="1.3"
              >
                Tanyakan data santri &amp; wali santri
              </Text>
              <Text fontSize="13px" color={mutedText} lineHeight="1.5">
                {hint}
              </Text>
            </VStack>

            <VStack align="stretch" spacing={2} mt={5}>
              <Text
                fontSize="11px"
                fontWeight={600}
                color={mutedText}
                letterSpacing="0.06em"
                textTransform="uppercase"
              >
                Coba tanyakan
              </Text>
              {SUGGESTIONS.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  justifyContent="flex-start"
                  textAlign="left"
                  variant="outline"
                  borderColor={borderColor}
                  color={headerText}
                  bg={surfaceBg}
                  fontWeight={500}
                  fontSize="13px"
                  borderRadius="10px"
                  h="auto"
                  py={2}
                  px={3}
                  whiteSpace="normal"
                  _hover={{ borderColor: accent, color: accent, bg: surfaceBg }}
                  isDisabled={isBusy}
                  onClick={() => runSuggestion(s)}
                >
                  {s}
                </Button>
              ))}
            </VStack>
          </Box>
        )}

        {messages.map((msg) => {
          const text = getTextFromParts(
            msg.parts as Array<{ type: string; text?: string }>
          );
          if (!text) return null;
          const isUser = msg.role === 'user';
          return (
            <HStack
              key={msg.id}
              align="flex-start"
              spacing={2}
              mb={4}
              justify={isUser ? 'flex-end' : 'flex-start'}
              sx={{ animation: `${fadeUpAnim} 0.22s ease-out both` }}
            >
              {!isUser && (
                <Box
                  w={7}
                  h={7}
                  borderRadius="9px"
                  bg={accent}
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  mt={0.5}
                >
                  <FiMessageSquare size={14} />
                </Box>
              )}
              <Box maxW={isUser ? '82%' : '86%'}>
                {isUser ? (
                  <Box
                    px={3.5}
                    py={2.5}
                    bg={userBubbleBg}
                    color="white"
                    fontSize="14px"
                    lineHeight="1.5"
                    borderRadius="14px 14px 2px 14px"
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                    boxShadow="0 1px 2px rgba(15,23,42,.12)"
                  >
                    {text}
                  </Box>
                ) : (
                  <Box
                    px={3.5}
                    py={3}
                    bg={assistantBubbleBg}
                    border="1px solid"
                    borderColor={borderColor}
                    color={headerText}
                    fontSize="14px"
                    borderRadius="2px 14px 14px 14px"
                    wordBreak="break-word"
                    boxShadow="0 1px 3px rgba(15,23,42,.05)"
                  >
                    <AssistantMarkdown text={prepareAssistantMarkdown(text)} />
                    {resultCount && (
                      <HStack
                        spacing={1.5}
                        mt={3}
                        pt={2.5}
                        borderTop="1px dashed"
                        borderColor={borderColor}
                      >
                        <Text color={accent} fontSize="12px" fontWeight={700}>
                          {resultCount}
                        </Text>
                        <Text color={mutedText} fontSize="12px">
                          · sumber data tahun 2025–2027
                        </Text>
                      </HStack>
                    )}
                  </Box>
                )}
              </Box>
            </HStack>
          );
        })}

        {/* Loading / typing */}
        {isPreparing && (
          <HStack align="flex-start" spacing={2}>
            <Box
              w={7}
              h={7}
              borderRadius="9px"
              bg={accent}
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <FiMessageSquare size={14} />
            </Box>
            <Box
              px={3.5}
              py={2.5}
              bg={assistantBubbleBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="2px 14px 14px 14px"
            >
              <HStack spacing={2.5}>
                <Box
                  w={3}
                  h={3}
                  borderRadius="full"
                  border="2px solid"
                  borderColor={accent}
                  borderTopColor="transparent"
                  sx={{ animation: `${spinAnim} 0.8s linear infinite` }}
                />
                <Text fontSize="12px" color={mutedText}>
                  {loadingSteps[stepIdx % loadingSteps.length]}
                </Text>
              </HStack>
            </Box>
          </HStack>
        )}
        {isStreaming && (
          <HStack align="flex-start" spacing={2}>
            <Box
              w={7}
              h={7}
              borderRadius="9px"
              bg={accent}
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <FiMessageSquare size={14} />
            </Box>
            <Box
              px={3.5}
              py={3}
              bg={assistantBubbleBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="2px 14px 14px 14px"
            >
              <HStack spacing={1}>
                <Text color={mutedText} fontSize="12px">
                  Mengetik
                </Text>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    w={1}
                    h={1}
                    borderRadius="full"
                    bg={mutedText}
                    sx={{
                      animation: `${blinkAnim} 1.3s infinite both`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </HStack>
            </Box>
          </HStack>
        )}

        {error && (
          <Box
            px={3.5}
            py={2.5}
            mt={2}
            bg="rgba(239,68,68,0.08)"
            border="1px solid"
            borderColor="rgba(239,68,68,0.3)"
            color={errorText}
            fontSize="13px"
            borderRadius="10px"
          >
            Gagal mengambil jawaban. Silakan coba lagi.
          </Box>
        )}
        <Box ref={sentinelRef} h="1px" />
      </Box>

      {/* ===== Composer ===== */}
      <Box
        borderTop="1px solid"
        borderColor={borderColor}
        bg={surfaceBg}
        px={3}
        pt={3}
        pb={3}
        flexShrink={0}
        sx={{
          paddingBottom: {
            base: 'max(12px, env(safe-area-inset-bottom))',
            md: '12px',
          },
        }}
      >
        <HStack align="flex-end" spacing={2}>
          <Box
            flex={1}
            bg={inputBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="12px"
            _focusWithin={{
              borderColor: accent,
              boxShadow: `0 0 0 1px ${accent}`,
            }}
            transition="border-color .15s, box-shadow .15s"
          >
            <Textarea
              ref={inputRef}
              value={input}
              rows={1}
              minH="40px"
              maxH="140px"
              resize="none"
              placeholder={placeholder}
              fontSize="14px"
              bg="transparent"
              border="none"
              _focus={{ boxShadow: 'none' }}
              _placeholder={{ color: mutedText }}
              px={3}
              py={2.5}
              onChange={(e) => {
                setInput(e.target.value);
                autoGrow();
              }}
              onKeyDown={handleKeyDown}
            />
          </Box>

          {isStreaming ? (
            <IconButton
              aria-label="Hentikan"
              onClick={handleStop}
              h="40px"
              w="40px"
              flexShrink={0}
              colorScheme="red"
              variant="outline"
              borderRadius="10px"
              icon={<FiStopCircle size={18} />}
            />
          ) : (
            <IconButton
              aria-label="Kirim"
              type="submit"
              onClick={handleSubmit}
              isDisabled={!input.trim() || isBusy}
              h="40px"
              w="40px"
              flexShrink={0}
              color="white"
              bg={accent}
              borderRadius="10px"
              _hover={{ bg: accentHover }}
              _active={{ transform: 'scale(.96)' }}
              _disabled={{
                opacity: 0.45,
                cursor: 'not-allowed',
                boxShadow: 'none',
              }}
              transition="all .15s"
              icon={<FiSend size={17} />}
            />
          )}
        </HStack>
        <Text mt={1.5} fontSize="10.5px" color={mutedText} textAlign="center">
          Enter untuk kirim · Shift + Enter untuk baris baru
        </Text>
      </Box>
    </Box>
  );
}
