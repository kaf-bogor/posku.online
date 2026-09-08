import {
  Box,
  Flex,
  Text,
  Link as ChakraLink,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    label: 'Amal',
    href: '/amal',
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
  const { textColor } = useContext(AppContext);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // Liquid glass (iOS)
  const glassBg = useColorModeValue(
    'rgba(255,255,255,0.6)',
    'rgba(13,16,24,0.5)'
  );
  const glassBorder = useColorModeValue(
    'rgba(255,255,255,0.65)',
    'rgba(255,255,255,0.12)'
  );
  const glassShadow = useColorModeValue(
    '0 -6px 30px rgba(15,23,42,0.12)',
    '0 -6px 30px rgba(0,0,0,0.4)'
  );
  const itemActiveBg = useColorModeValue(
    'rgba(124,58,237,0.12)',
    'rgba(167,139,250,0.16)'
  );

  return (
    <Box
      position="fixed"
      bottom={0}
      left="50%"
      transform="translateX(-50%)"
      zIndex={100}
      w="100%"
      maxWidth={800}
      style={{
        backgroundColor: glassBg,
        borderTop: `1px solid ${glassBorder}`,
        boxShadow: glassShadow,
        backdropFilter: 'blur(22px) saturate(180%)',
        WebkitBackdropFilter: 'blur(22px) saturate(180%)',
      }}
      px={{ base: 1, md: 2 }}
      py={{ base: 2, md: 1 }}
    >
      <Flex justify="space-around" align="center">
        {navItems.map(({ label, href, icon }) => {
          const active = isActive(href);
          return (
            <Link href={href} passHref key={label} legacyBehavior>
              <ChakraLink
                display="flex"
                flexDirection="column"
                alignItems="center"
                fontSize="xs"
                color={active ? 'purple.500' : textColor}
                fontWeight={active ? 'bold' : 'medium'}
                _hover={{ color: 'purple.600' }}
                minW={{ base: '70px', md: '60px' }}
                minH={{ base: '50px', md: 'auto' }}
                py={1}
                px={2}
                borderRadius="lg"
                bg={active ? itemActiveBg : 'transparent'}
                transition="all 0.2s"
                _active={{
                  bg: 'purple.100',
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
                <Text fontSize="xs" fontWeight="medium">
                  {label}
                </Text>
              </ChakraLink>
            </Link>
          );
        })}
      </Flex>
    </Box>
  );
}
