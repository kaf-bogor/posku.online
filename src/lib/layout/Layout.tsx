'use client';

import { Box, useColorMode } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useContext, useEffect } from 'react';

import BottomNav from '~/app/components/BottomNav';
import Promo from '~/lib/components/Promo';
import { AppContext } from '~/lib/context/app';

import Header from './Header';

type LayoutProps = {
  children: ReactNode;
};

const ALLOWED_PROMO_PATH = ['/false'];

const Layout = ({ children }: LayoutProps) => {
  const { colorMode } = useColorMode();

  const { image, title, isDisplayPromo, subtitle, setIsDisplayPromo } =
    useContext(AppContext);

  const pathname = usePathname();

  useEffect(() => {
    setIsDisplayPromo(ALLOWED_PROMO_PATH.includes(pathname));
    return () => {
      setIsDisplayPromo(false);
    };
  }, [setIsDisplayPromo, pathname]);

  return (
    <Box
      margin="0 auto"
      maxWidth={800}
      transition="0.5s ease-out"
      minH="100vh"
      bg={colorMode === 'light' ? 'gray.100' : 'gray.800'}
      position="relative"
    >
      {isDisplayPromo && <Promo />}

      <Header image={image} title={title} subtitle={subtitle} />

      <Box
        as="main"
        padding={{ base: 4, md: 6 }}
        pt={{ base: '140px', md: '160px' }}
        pb={{ base: '80px', md: '60px' }}
      >
        {children}
      </Box>
      <BottomNav />
    </Box>
  );
};

export default Layout;
