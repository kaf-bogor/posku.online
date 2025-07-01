import { Button, VStack, Heading, Box, HStack } from '@chakra-ui/react';
import Link from 'next/link';
import {
  FaInstagram,
  FaWhatsapp,
  FaGlobe,
  FaWpforms,
  FaRegCommentDots,
} from 'react-icons/fa';

// Server component
const categorizedLinks = [
  {
    category: 'Formulir',
    icon: FaWpforms,
    links: [
      {
        label: 'Daftar Program Ta’awun Tali Asih POSKU',
        href: 'https://bit.ly/posku-tali-asih',
      },
      {
        label: 'Formulir data wali santri',
        href: 'https://forms.gle/CCNE2XC4s5t8HALz8',
      },
    ],
  },
  {
    category: 'Feedback',
    icon: FaRegCommentDots,
    links: [
      {
        label: 'Saran & Masukan',
        href: 'https://bit.ly/posku-saran-masukan',
      },
    ],
  },
  {
    category: 'Sosial Media',
    icon: FaInstagram,
    links: [
      {
        label: 'Instagram Kuttab Al-Fatih Bogor',
        href: 'https://www.instagram.com/posku_bogor/',
      },
      {
        label: 'Instagram POSKU',
        href: 'https://www.instagram.com/poskukuttabalfatihbogor',
      },
    ],
  },
  {
    category: 'Kontak',
    icon: FaWhatsapp,
    links: [
      {
        label: 'Whatsapp qowamah',
        href: 'https://wa.me/+6285710123686',
      },
      {
        label: 'Whatsapp ummahat',
        href: 'https://wa.me/+628119118212',
      },
    ],
  },

  {
    category: 'Website',
    icon: FaGlobe,
    links: [
      {
        label: 'Kuttab Al-Fatih',
        href: 'https://kuttabalfatih.com/',
      },
      {
        label: 'Kuttab Al-Fatih Bogor',
        href: 'https://sites.google.com/view/kafbogor',
      },
    ],
  },
];

const Home = async () => {
  return (
    <VStack gap={[8, 6]} align="stretch" w="full" py={6}>
      {categorizedLinks.map(({ category, icon: Icon, links }) => (
        <Box key={category}>
          <HStack mb={3} spacing={2}>
            <Icon size={24} />
            <Heading as="h2" size="md">
              {category}
            </Heading>
          </HStack>
          <VStack gap={2} align="stretch">
            {links.map(({ href, label }) => (
              <Link href={href} key={href} passHref legacyBehavior>
                <Button
                  as="a"
                  leftIcon={<Icon size={18} />}
                  w="full"
                  justifyContent="flex-start"
                  bg="white"
                  borderRadius="md"
                  boxShadow="md"
                  color="gray.700"
                >
                  {label}
                </Button>
              </Link>
            ))}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
};

export default Home;
