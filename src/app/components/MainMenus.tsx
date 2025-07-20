'use client';

import {
  Box,
  Image,
  SimpleGrid,
  Text,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import type { IconType } from 'react-icons';

const MainMenus = ({
  items,
}: {
  items: {
    label: string;
    href: string;
    icon?: IconType;
    imageUrl?: string;
  }[];
}) => {
  const labelColor = useColorModeValue('gray.800', 'gray.700');
  return (
    <Flex justify="space-between" align="start">
      <SimpleGrid columns={3} spacing={8} w="100%" pt={6}>
        {items.map(({ href, label, icon: Icon, imageUrl }) => (
          <Link href={href} key={href} passHref legacyBehavior>
            <Box
              as="a"
              bg="white"
              borderRadius="xl"
              boxShadow="md"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minH="110px"
              aspectRatio="1"
              transition="all 0.2s"
              _hover={{ boxShadow: 'lg', bg: 'purple.50', color: 'purple.600' }}
              cursor="pointer"
              p={4}
            >
              {imageUrl && <Image src={imageUrl} width="48px" />}
              {Icon && (
                <Box as="span" mb={2}>
                  <Text
                    as="span"
                    color={labelColor}
                    fontSize="2xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon fontSize={32} />
                  </Text>
                </Box>
              )}
              <Text
                fontSize="sm"
                fontWeight="semibold"
                textAlign="center"
                color={labelColor}
              >
                {label}
              </Text>
            </Box>
          </Link>
        ))}
      </SimpleGrid>
    </Flex>
  );
};

export default MainMenus;
