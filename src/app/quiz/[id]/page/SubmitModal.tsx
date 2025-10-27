'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Stack,
  Text,
  Box,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

import { formatTime } from '../utils';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  answeredQuestions: number;
  totalQuestions: number;
  timeUsed: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function SubmitModal({
  isOpen,
  onClose,
  answeredQuestions,
  totalQuestions,
  timeUsed,
  onSubmit,
  isSubmitting,
}: SubmitModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Kirim Kuis</ModalHeader>
        <ModalBody>
          <Stack spacing={4}>
            <Text>Apakah Anda yakin ingin mengirim kuis Anda?</Text>
            <Box>
              <Text>
                <strong>Terjawab:</strong> {answeredQuestions} dari{' '}
                {totalQuestions} pertanyaan
              </Text>
              <Text>
                <strong>Waktu digunakan:</strong> {formatTime(timeUsed)}
              </Text>
            </Box>
            {answeredQuestions < totalQuestions && (
              <Alert status="warning" size="sm">
                <AlertIcon />
                Anda memiliki pertanyaan yang belum dijawab. Mereka akan
                ditandai sebagai salah.
              </Alert>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Batal
          </Button>
          <Button
            colorScheme="green"
            onClick={onSubmit}
            isLoading={isSubmitting}
          >
            Kirim Kuis
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
