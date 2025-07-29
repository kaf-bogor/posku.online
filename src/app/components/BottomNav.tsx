import { Box, Flex, Text, Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';
import { useContext } from 'react';
import { FaHome, FaHandsHelping, FaLink, FaUser } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';

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
  {
    label: 'Admin',
    href: '/admin',
    icon: 'admin',
  },
];

export default function BottomNav() {
  const { bgColor, borderColor, textColor } = useContext(AppContext);
  return (
    <Box
      position="fixed"
      bottom={0}
      w="100%"
      bg={bgColor}
      borderTop={`1px solid ${borderColor}`}
      zIndex={100}
      boxShadow="0 -2px 12px rgba(0,0,0,0.1)"
      px={{ base: 1, md: 2 }}
      py={{ base: 2, md: 1 }}
      maxWidth={800}
      left="50%"
      transform="translateX(-50%)"
      backdropFilter="blur(10px)"
    >
      <Flex justify="space-around" align="center">
        {navItems.map(({ label, href, icon }) => (
          <Link href={href} passHref key={label} legacyBehavior>
            <ChakraLink
              display="flex"
              flexDirection="column"
              alignItems="center"
              fontSize="xs"
              color={textColor}
              _hover={{ color: 'purple.600' }}
              minW={{ base: "70px", md: "60px" }}
              minH={{ base: "50px", md: "auto" }}
              justify="center"
              py={1}
              borderRadius="lg"
              transition="all 0.2s"
              _active={{
                bg: 'purple.50',
                transform: 'scale(0.95)',
              }}
            >
              {icon === 'home' && (
                <FaHome fontSize={20} style={{ marginBottom: 2 }} />
              )}
              {icon === 'donate' && (
                <FaHandsHelping fontSize={20} style={{ marginBottom: 2 }} />
              )}
              {icon === 'links' && (
                <FaLink fontSize={20} style={{ marginBottom: 2 }} />
              )}
              {icon === 'admin' && (
                <FaUser fontSize={20} style={{ marginBottom: 2 }} />
              )}
              <Text fontSize="xs" fontWeight="medium">{label}</Text>
            </ChakraLink>
          </Link>
        ))}
      </Flex>
    </Box>
  );
}
