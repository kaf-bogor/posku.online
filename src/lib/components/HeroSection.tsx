import {
  Box,
  VStack,
  Text,
  Image,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';

import { storageUrl } from '~/lib/context/baseUrl';

const HeroSection = () => {
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, blue.50, green.50)',
    'linear(to-br, purple.900, blue.900, gray.800)'
  );
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const titleColor = useColorModeValue('gray.800', 'white');

  return (
    <Box
      bgGradient={bgGradient}
      borderRadius="xl"
      p={{ base: 4, md: 5 }}
      position="relative"
      overflow="hidden"
    >
      <VStack spacing={3} align="center" textAlign="center">
        <Image
          src={`${storageUrl}/logo_posku.png?alt=media`}
          alt="POSKU Al-Fatih"
          width={{ base: "60px", md: "80px" }}
          height={{ base: "60px", md: "80px" }}
        />
        <VStack spacing={1}>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            color={titleColor}
            lineHeight="short"
          >
            POSKU Al-Fatih Bogor
          </Text>
          <Text
            fontSize={{ base: "xs", md: "sm" }}
            color={textColor}
            maxW="350px"
            lineHeight="relaxed"
          >
            Paguyuban Orang Tua Santri Kuttab Al-Fatih Bogor
          </Text>
        </VStack>
      </VStack>
      
      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-20px"
        right="-20px"
        w="100px"
        h="100px"
        borderRadius="full"
        bg="purple.100"
        opacity={0.3}
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-30px"
        left="-30px"
        w="80px"
        h="80px"
        borderRadius="full"
        bg="blue.100"
        opacity={0.3}
        zIndex={0}
      />
    </Box>
  );
};

export default HeroSection;
