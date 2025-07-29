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
  const cardBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('purple.50', 'purple.900');

  return (
    <SimpleGrid
      columns={{ base: 2, sm: 3, md: 3 }}
      spacing={{ base: 4, md: 6 }}
      w="100%"
    >
      {items.map(({ href, label, icon: Icon, imageUrl }) => (
        <Link href={href} key={href} passHref legacyBehavior>
          <Box
            as="a"
            bg={cardBg}
            borderRadius="xl"
            boxShadow="md"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minH={{ base: "100px", md: "110px" }}
            aspectRatio="1"
            transition="all 0.3s ease"
            _hover={{
              boxShadow: 'xl',
              bg: hoverBg,
              color: 'purple.600',
              transform: 'translateY(-2px)'
            }}
            cursor="pointer"
            p={{ base: 3, md: 4 }}
          >
            {imageUrl && (
              <Image
                src={imageUrl}
                width={{ base: "40px", md: "48px" }}
                height={{ base: "40px", md: "48px" }}
                mb={2}
              />
            )}
            {Icon && (
              <Box as="span" mb={2}>
                <Icon
                  fontSize={{ base: 28, md: 32 }}
                  color={labelColor}
                />
              </Box>
            )}
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="semibold"
              textAlign="center"
              color={labelColor}
              lineHeight="short"
            >
              {label}
            </Text>
          </Box>
        </Link>
      ))}
    </SimpleGrid>
  );
};

export default MainMenus;
