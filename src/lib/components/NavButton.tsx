'use client';

import { Button, type ButtonProps } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface NavButtonProps extends Omit<ButtonProps, 'onClick' | 'href'> {
  href: string;
  /** Panggil sebelum navigasi dimulai (mis. set state). */
  onBeforeNavigate?: () => void;
}

/**
 * Tombol yang memberi umpan balik loading seketika saat diklik sebelum
 * berpindah halaman (router.push), lalu menavigasi ke `href`.
 */
export default function NavButton({
  href,
  onBeforeNavigate,
  isDisabled = false,
  children,
  ...rest
}: NavButtonProps) {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const disabled = navigating || isDisabled;

  return (
    <Button
      {...rest}
      isDisabled={disabled}
      isLoading={navigating}
      onClick={() => {
        if (onBeforeNavigate) onBeforeNavigate();
        setNavigating(true);
        router.push(href);
      }}
    >
      {children}
    </Button>
  );
}
