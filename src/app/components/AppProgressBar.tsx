'use client';

import { Box } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function AppProgressBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    clearTimers();
    setVisible(true);
    setProgress(20);

    timers.current.push(
      setTimeout(() => setProgress(60), 120),
      setTimeout(() => setProgress(85), 300)
    );

    timers.current.push(
      setTimeout(() => setProgress(100), 500),
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 650)
    );

    return clearTimers;
  }, [pathname]);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      height="3px"
      zIndex={1400}
      bg="purple.500"
      width={`${progress}%`}
      opacity={visible ? 1 : 0}
      transition="opacity 0.2s ease"
      pointerEvents="none"
      boxShadow="0 0 8px rgba(128, 90, 213, 0.5)"
    />
  );
}
