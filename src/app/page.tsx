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
import { FaUsers, FaEnvelopeOpenText, FaRegFileAlt } from 'react-icons/fa';

import { firebaseUrl } from '~/lib/context/baseUrl';

const menuItems = [
  {
    label: 'Tentang POSKU',
    href: '/tentang',
    imageUrl: `${firebaseUrl}logo_posku.png?alt=media`,
  },
  {
    label: 'Pengurus',
    href: '/pengurus',
    icon: FaUsers,
  },
  {
    label: 'Newsletter',
    href: '/newsletter',
    icon: FaEnvelopeOpenText,
  },
  {
    label: 'Muslimah Center',
    href: '/muslimah_center',
    imageUrl: `${firebaseUrl}mc_light.png?alt=media`,
  },
  {
    label: 'Laporan',
    href: '/reports',
    icon: FaRegFileAlt,
  },
];

const Home = () => {
  const labelColor = useColorModeValue('gray.800', 'gray.700');
  return (
    <Flex justify="center" align="start" minH="80vh" px={2}>
      <SimpleGrid
        columns={{ base: 2, sm: 3 }}
        spacing={4}
        w="100%"
        maxW="600px"
        pt={6}
      >
        {menuItems.map(({ href, label, icon: Icon, imageUrl }) => (
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

export default Home;
