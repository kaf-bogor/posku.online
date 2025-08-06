'use client';

/* eslint-disable react-hooks/rules-of-hooks */

import {
  Button,
  VStack,
  HStack,
  Heading,
  Box,
  Text,
  Container,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import Link from 'next/link';
import {
  FaInstagram,
  FaWhatsapp,
  FaGlobe,
  FaWpforms,
  FaRegCommentDots,
  FaExternalLinkAlt,
  FaHeart,
  FaUsers,
  FaBookOpen,
} from 'react-icons/fa';

const HOVER_TRANSFORM = 'translateY(-2px)';

// Enhanced categorized links with descriptions and additional metadata
const categorizedLinks = [
  {
    category: 'Formulir',
    description: 'Formulir pendaftaran dan data wali santri',
    icon: FaWpforms,
    color: 'blue',
    links: [
      {
        label: "Daftar Program Ta'awun Tali Asih POSKU",
        description: 'Formulir pendaftaran program bantuan sosial',
        href: 'https://bit.ly/posku-tali-asih',
        icon: FaHeart,
      },
      {
        label: 'Formulir Data Wali Santri',
        description: 'Isi data lengkap wali santri Kuttab Al-Fatih',
        href: 'https://forms.gle/CCNE2XC4s5t8HALz8',
        icon: FaUsers,
      },
    ],
  },
  {
    category: 'Feedback',
    description: 'Berikan saran dan masukan untuk perbaikan',
    icon: FaRegCommentDots,
    color: 'purple',
    links: [
      {
        label: 'Saran & Masukan',
        description: 'Kirimkan feedback untuk kemajuan POSKU',
        href: 'https://bit.ly/posku-saran-masukan',
        icon: FaRegCommentDots,
      },
    ],
  },
  {
    category: 'Sosial Media',
    description: 'Ikuti akun media sosial resmi kami',
    icon: FaInstagram,
    color: 'pink',
    links: [
      {
        label: 'Instagram Kuttab Al-Fatih Bogor',
        description: '@posku_bogor - Akun resmi Kuttab Al-Fatih Bogor',
        href: 'https://www.instagram.com/posku_bogor/',
        icon: FaInstagram,
      },
      {
        label: 'Instagram POSKU',
        description: '@poskukuttabalfatihbogor - Paguyuban Orang Tua',
        href: 'https://www.instagram.com/poskukuttabalfatihbogor',
        icon: FaInstagram,
      },
    ],
  },
  {
    category: 'Kontak',
    description: 'Hubungi pengurus POSKU',
    icon: FaWhatsapp,
    color: 'green',
    links: [
      {
        label: 'WhatsApp Qowamah',
        description: 'Kontak pengurus putra - Ahli keluarga laki-laki',
        href: 'https://wa.me/+6285710123686',
        icon: FaWhatsapp,
      },
      {
        label: 'WhatsApp Ummahat',
        description: 'Kontak pengurus putri - Ahli keluarga perempuan',
        href: 'https://wa.me/+628119118212',
        icon: FaWhatsapp,
      },
    ],
  },
  {
    category: 'Website',
    description: 'Kunjungi website resmi Kuttab Al-Fatih',
    icon: FaGlobe,
    color: 'orange',
    links: [
      {
        label: 'Kuttab Al-Fatih',
        description: 'Website resmi Kuttab Al-Fatih pusat',
        href: 'https://kuttabalfatih.com/',
        icon: FaBookOpen,
      },
      {
        label: 'Kuttab Al-Fatih Bogor',
        description: 'Informasi khusus cabang Bogor',
        href: 'https://sites.google.com/view/kafbogor',
        icon: FaGlobe,
      },
    ],
  },
];

const LinksPage = () => {
  // Color theme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const titleColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center" py={6}>
            <Heading size="2xl" color={titleColor} fontWeight="bold">
              Tautan Penting
            </Heading>
            <Text
              fontSize="lg"
              color={textColor}
              maxW="600px"
              lineHeight="relaxed"
            >
              Akses cepat ke formulir, kontak, media sosial, dan website resmi
              POSKU Al-Fatih Bogor
            </Text>
          </VStack>

          {/* Links Grid */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {categorizedLinks.map(
              ({ category, description, icon: CategoryIcon, color, links }) => (
                <Box
                  key={category}
                  bg={cardBg}
                  borderRadius="2xl"
                  p={6}
                  boxShadow="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  transition="all 0.3s ease"
                  _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: '2xl',
                  }}
                >
                  {/* Category Header */}
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={4} align="center">
                      <Box
                        p={3}
                        borderRadius="xl"
                        bg={`${color}.50`}
                        color={`${color}.500`}
                      >
                        <CategoryIcon size={24} />
                      </Box>
                      <VStack align="start" spacing={1} flex={1}>
                        <Heading as="h3" size="md" color={titleColor}>
                          {category}
                        </Heading>
                        <Text fontSize="sm" color={textColor}>
                          {description}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={color}
                        variant="subtle"
                        borderRadius="full"
                        px={3}
                        py={1}
                      >
                        {links.length} link{links.length > 1 ? 's' : ''}
                      </Badge>
                    </HStack>

                    {/* Links */}
                    <VStack spacing={3} align="stretch">
                      {links.map(
                        ({
                          href,
                          label,
                          description: linkDesc,
                          icon: LinkIcon,
                        }) => (
                          <Link href={href} key={href} passHref legacyBehavior>
                            <Button
                              as="a"
                              target="_blank"
                              rel="noopener noreferrer"
                              h="auto"
                              p={4}
                              justifyContent="flex-start"
                              textAlign="left"
                              bg={useColorModeValue(
                                `${color}.50`,
                                `${color}.900`
                              )}
                              color={useColorModeValue(
                                `${color}.700`,
                                `${color}.200`
                              )}
                              borderColor={useColorModeValue(
                                `${color}.200`,
                                `${color}.600`
                              )}
                              border="1px solid"
                              borderRadius="xl"
                              transition="all 0.3s ease"
                              _hover={{
                                bg: useColorModeValue(
                                  `${color}.100`,
                                  `${color}.800`
                                ),
                                borderColor: useColorModeValue(
                                  `${color}.300`,
                                  `${color}.500`
                                ),
                                transform: HOVER_TRANSFORM,
                                boxShadow: 'md',
                              }}
                              _active={{
                                transform: 'translateY(0)',
                              }}
                            >
                              <HStack spacing={4} align="start" w="100%">
                                <Box
                                  p={2}
                                  borderRadius="lg"
                                  bg={useColorModeValue(
                                    `${color}.100`,
                                    `${color}.700`
                                  )}
                                  color={useColorModeValue(
                                    `${color}.600`,
                                    `${color}.300`
                                  )}
                                  flexShrink={0}
                                >
                                  <LinkIcon size={18} />
                                </Box>
                                <VStack
                                  align="start"
                                  spacing={1}
                                  flex={1}
                                  minW={0}
                                >
                                  <HStack
                                    justify="space-between"
                                    w="100%"
                                    align="center"
                                  >
                                    <Text
                                      fontWeight="semibold"
                                      fontSize="sm"
                                      noOfLines={1}
                                      flex={1}
                                    >
                                      {label}
                                    </Text>
                                    <Icon
                                      as={FaExternalLinkAlt}
                                      boxSize={3}
                                      opacity={0.6}
                                      flexShrink={0}
                                    />
                                  </HStack>
                                  <Text
                                    fontSize="xs"
                                    opacity={0.8}
                                    lineHeight="short"
                                    noOfLines={1}
                                    whiteSpace="normal"
                                    sx={{
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                    }}
                                  >
                                    {linkDesc}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Button>
                          </Link>
                        )
                      )}
                    </VStack>
                  </VStack>
                </Box>
              )
            )}
          </SimpleGrid>

          {/* Footer Call to Action */}
          <Box
            bg={cardBg}
            borderRadius="2xl"
            p={8}
            textAlign="center"
            border="1px solid"
            borderColor={borderColor}
            mt={8}
          >
            <VStack spacing={4}>
              <Box
                p={4}
                borderRadius="full"
                bg={useColorModeValue('blue.50', 'blue.900')}
                color={useColorModeValue('blue.500', 'blue.300')}
              >
                <FaHeart size={32} />
              </Box>
              <VStack spacing={2}>
                <Heading size="lg" color={titleColor}>
                  Bersama, Kita Wujudkan Peradaban Islam
                </Heading>
                <Text color={textColor} maxW="500px">
                  POSKU Al-Fatih Bogor adalah paguyuban orang tua santri yang
                  berkomitmen untuk mendukung pendidikan Islam yang berkualitas.
                </Text>
              </VStack>
              <HStack spacing={4} flexWrap="wrap" justify="center">
                <Button
                  as="a"
                  href="https://wa.me/+6285710123686"
                  target="_blank"
                  colorScheme="green"
                  leftIcon={<FaWhatsapp />}
                  borderRadius="xl"
                  _hover={{ transform: HOVER_TRANSFORM }}
                >
                  Hubungi Pengurus
                </Button>
                <Button
                  as="a"
                  href="https://www.instagram.com/posku_bogor/"
                  target="_blank"
                  colorScheme="pink"
                  variant="outline"
                  leftIcon={<FaInstagram />}
                  borderRadius="xl"
                  _hover={{ transform: HOVER_TRANSFORM }}
                >
                  Follow Instagram
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default LinksPage;
