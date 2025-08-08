'use client';

import { Box, VStack, IconButton, HStack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useContext } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';

export default function ContentWrapper({
  withBg = true,
  withPadding = true,
  children,
}: Props) {
  const { bgColor } = useContext(AppContext);
  return (
    <VStack gap={8} align="flex-start" mb={8}>
      <HStack
        gap={2}
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.history.back();
          }
        }}
        cursor="pointer"
      >
        <IconButton
          aria-label="Kembali"
          icon={<FaArrowLeft />}
          variant="ghost"
          size="sm"
        />
        <Text> Kembali </Text>
      </HStack>
      <Box
        bg={withBg ? bgColor : 'transparent'}
        shadow={withBg ? 'md' : 'none'}
        rounded="xl"
        w="full"
        p={withPadding ? 6 : 0}
      >
        {children}
      </Box>
    </VStack>
  );
}

type Props = {
  withPadding?: boolean;
  withBg?: boolean;
  children?: ReactNode;
};
