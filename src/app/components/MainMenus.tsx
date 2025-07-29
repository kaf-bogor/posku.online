'use client';

import {
  Box,
  Image,
  Text,
  HStack,
  VStack,
  useColorModeValue,
  Flex,
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
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const cardBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('purple.50', 'purple.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box w="100%" overflowX="auto" pb={2}>
      <HStack spacing={3} align="stretch" minW="fit-content" px={1}>
        {items.map(({ href, label, icon: Icon, imageUrl }) => (
          <Link href={href} key={href} passHref legacyBehavior>
            <Box
              as="a"
              bg={cardBg}
              borderRadius="xl"
              border="1px solid"
              borderColor={borderColor}
              boxShadow="sm"
              minW="85px"
              maxW="100px"
              transition="all 0.2s ease"
              _hover={{
                boxShadow: 'md',
                bg: hoverBg,
                borderColor: 'purple.300',
                transform: 'translateY(-1px)',
              }}
              cursor="pointer"
              overflow="hidden"
            >
              <VStack spacing={2} p={3} align="center" justify="center">
                {/* Icon/Image Container */}
                <Box
                  w="40px"
                  h="40px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="lg"
                  bg={useColorModeValue('gray.50', 'gray.600')}
                  flexShrink={0}
                >
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      width="28px"
                      height="28px"
                      alt={label}
                      borderRadius="md"
                    />
                  )}
                  {Icon && <Icon fontSize={24} color={labelColor} />}
                </Box>

                {/* Label */}
                <Text
                  fontSize="xs"
                  fontWeight="medium"
                  textAlign="center"
                  color={labelColor}
                  lineHeight="tight"
                  noOfLines={2}
                  minH="32px"
                  display="flex"
                  alignItems="center"
                >
                  {label}
                </Text>
              </VStack>
            </Box>
          </Link>
        ))}
      </HStack>
    </Box>
  );
};

export default MainMenus;
