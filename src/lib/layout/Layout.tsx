'use client';

import { Box, Divider, Flex, Image, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useContext, useEffect } from 'react';

import Promo from '~/lib/components/Promo';
import { AppContext } from '~/lib/context/app';

import Footer from './Footer';
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
    <Box margin="0 auto" maxWidth={800} transition="0.5s ease-out">
      <Box margin="8">
        {isDisplayPromo && <Promo />}

        <Header />

        <Box as="main" marginY={22}>
          <Flex
            direction="column"
            alignItems="center"
            justifyContent="start"
            minHeight="70vh"
            gap={4}
            mb={8}
            w="full"
          >
            <Link href="/">
              <Image width="100px" src={image} />
            </Link>
            <VStack>
              <Text fontWeight="bold" fontSize="x-large">
                {title}
              </Text>
              <Text>{subtitle}</Text>
            </VStack>
            <Divider />

            {children}
          </Flex>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
