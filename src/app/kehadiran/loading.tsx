'use client';

import { Center, Spinner } from '@chakra-ui/react';

export default function KehadiranLoading() {
  return (
    <Center py={12} minH="40vh">
      <Spinner size="lg" color="purple.500" />
    </Center>
  );
}
