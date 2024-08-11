'use client';

import { Box, Flex, Image, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import Footer from './Footer';
import Header from './Header';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box margin="0 auto" maxWidth={800} transition="0.5s ease-out">
      <Box margin="8">
        <Header />
        <Box as="main" marginY={22}>
          <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            minHeight="70vh"
            gap={4}
            mb={8}
            w="full"
          >
            <Link href="/">
              <Image
                width="100px"
                src="https://cdn.bio.link/uploads/profile_pictures/2023-09-01/RizW5SRGfiudfwxr6w0kBp1GvarjnLQu.png"
              />
            </Link>
            <VStack>
              <Text fontWeight="bold" fontSize="x-large">
                POSKU Al-Fatih Bogor
              </Text>
              <Text>Persatuan Orangtua Santri Kuttab Al-Fatih Bogor</Text>
            </VStack>
            {children}
          </Flex>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
