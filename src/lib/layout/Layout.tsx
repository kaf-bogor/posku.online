'use client';

import { Box } from '@chakra-ui/react';
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
      bg="gray.100"
      position="relative"
    >
      {isDisplayPromo && <Promo />}

      <Header image={image} title={title} subtitle={subtitle} />

      <Box as="main" padding={6} pt="160px">
        {children}
      </Box>
      <BottomNav />
    </Box>
  );
};

export default Layout;
