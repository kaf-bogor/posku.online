'use client';

import {
  Box,
  Button,
  Text,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useCallback, useEffect, useRef, useState } from 'react';

import { checkInAttendance } from '~/lib/services/attendanceService';

interface QrScannerProps {
  expectedEventId: string;
  userEmail: string;
}

export default function QrScanner({
  expectedEventId,
  userEmail,
}: QrScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageStatus, setMessageStatus] = useState<'success' | 'error'>(
    'success'
  );
  const [submitting, setSubmitting] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const toast = useToast();

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current
        .clear()
        .catch(() => {})
        .finally(() => {
          scannerRef.current = null;
        });
    }
    setScanning(false);
  }, []);

  const handleCheckIn = useCallback(
    async (scannedEventId: string) => {
      if (submitting) return;
      setSubmitting(true);
      stopScanner();

      try {
        const result = await checkInAttendance(scannedEventId, userEmail);
        setMessage(result.message);
        setMessageStatus(result.created ? 'success' : 'error');
        if (result.created) {
          toast({
            title: 'Check-in berhasil!',
            status: 'success',
            duration: 3000,
          });
        } else {
          toast({
            title: result.message,
            status: 'warning',
            duration: 3000,
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal check-in';
        setMessage(msg);
        setMessageStatus('error');
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, stopScanner, userEmail, toast]
  );

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const startScanner = useCallback(() => {
    setMessage(null);
    setScanning(true);

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          const text = decodedText.trim();

          // Extract eventId from URL or use raw text
          let scannedEventId = text;
          try {
            const url = new URL(text);
            const match = url.pathname.match(/\/kehadiran\/([^/]+)\/checkin/);
            if (match) {
              [, scannedEventId] = match;
            }
          } catch {
            // not a URL — use raw text as eventId
          }

          if (scannedEventId !== expectedEventId) {
            setMessage('QR Code tidak sesuai dengan event ini.');
            setMessageStatus('error');
            scanner.clear().catch(() => {});
            scannerRef.current = null;
            setScanning(false);
            return;
          }

          handleCheckIn(scannedEventId);
        },
        () => {}
      );

      scannerRef.current = scanner;
    }, 100);
  }, [expectedEventId, handleCheckIn]);

  return (
    <Box>
      {!scanning && (
        <Button
          colorScheme="purple"
          onClick={startScanner}
          isLoading={submitting}
        >
          Scan QR
        </Button>
      )}

      {scanning && (
        <Box mb={4}>
          <Box id="qr-reader" w="100%" />
          <Button
            size="sm"
            mt={2}
            variant="outline"
            colorScheme="red"
            onClick={stopScanner}
          >
            Batal Scan
          </Button>
        </Box>
      )}

      {message && (
        <Alert status={messageStatus} borderRadius="lg" mt={3}>
          <AlertIcon />
          <Text fontSize="sm">{message}</Text>
        </Alert>
      )}
    </Box>
  );
}
