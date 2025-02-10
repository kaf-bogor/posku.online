'use client';

import { Box, Divider, Flex, Image, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useContext } from 'react';

import { AppContext } from '~/lib/context/app';

import Footer from './Footer';
import Header from './Header';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { image, title, subtitle } = useContext(AppContext);

  return (
    <Box margin="0 auto" maxWidth={800} transition="0.5s ease-out">
      <Box margin="8">
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
