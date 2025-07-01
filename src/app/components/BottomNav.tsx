import { Box, Flex, Text, Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';
import { FaHome, FaHandsHelping, FaLink } from 'react-icons/fa';

const navItems = [
  {
    label: 'Beranda',
    href: '/',
    icon: 'home',
  },
  {
    label: 'Donasi',
    href: '/donasi',
    icon: 'donate',
  },
  {
    label: 'Links',
    href: '/links',
    icon: 'links',
  },
];

export default function BottomNav() {
  return (
    <Box
      position="fixed"
      bottom={0}
      w="100%"
      bg="white"
      borderTop="1px solid #eee"
      zIndex={100}
      boxShadow="0 -2px 8px rgba(0,0,0,0.04)"
      px={2}
      py={1}
      maxWidth={800}
      left="50%"
      transform="translateX(-50%)"
    >
      <Flex justify="space-around" align="center">
        {navItems.map(({ label, href, icon }) => (
          <Link href={href} passHref key={label} legacyBehavior>
            <ChakraLink
              display="flex"
              flexDirection="column"
              alignItems="center"
              fontSize="xs"
              color="gray.600"
              _hover={{ color: 'purple.600' }}
              minW="60px"
            >
              {icon === 'home' && (
                <FaHome fontSize={24} style={{ marginBottom: 4 }} />
              )}
              {icon === 'donate' && (
                <FaHandsHelping fontSize={24} style={{ marginBottom: 4 }} />
              )}
              {icon === 'links' && (
                <FaLink fontSize={24} style={{ marginBottom: 4 }} />
              )}
              <Text fontSize="xs">{label}</Text>
            </ChakraLink>
          </Link>
        ))}
      </Flex>
    </Box>
  );
}
