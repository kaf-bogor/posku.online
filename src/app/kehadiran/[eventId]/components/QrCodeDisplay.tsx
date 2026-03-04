'use client';

import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';

interface QrCodeDisplayProps {
  eventId: string;
}

export default function QrCodeDisplay({ eventId }: QrCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const muted = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    if (canvasRef.current) {
      const checkinUrl = `${window.location.origin}/kehadiran/${eventId}/checkin`;
      QRCode.toCanvas(
        canvasRef.current,
        checkinUrl,
        { width: 256, margin: 2 },
        () => {}
      );
    }
  }, [eventId]);

  return (
    <Box textAlign="center">
      <Heading size="sm" mb={2}>
        QR Code Event
      </Heading>
      <Text fontSize="xs" color={muted} mb={3}>
        Scan QR ini dengan kamera untuk check-in
      </Text>
      <Box display="inline-block" bg="white" p={2} borderRadius="lg">
        <canvas ref={canvasRef} />
      </Box>
    </Box>
  );
}
