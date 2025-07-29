import {
  Flex,
  HStack,
  Image,
  Link,
  Text,
  VStack,
  IconButton,
  useColorMode,
} from '@chakra-ui/react';
import { RiMoonFill, RiSunLine } from 'react-icons/ri';

import ShareButton from '~/lib/components/ShareButton';

const Header = ({
  image,
  title,
  subtitle,
}: {
  image: string;
  title: string;
  subtitle: string;
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <VStack
      position="fixed"
      w="full"
      zIndex={1000}
      top={0}
      maxWidth={800}
      left="50%"
      transform="translateX(-50%)"
    >
      <Flex
        as="header"
        width="full"
        align="center"
        justify="space-between"
        p={{ base: 3, md: 4 }}
        boxShadow="md"
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        borderBottom="1px solid"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
      >
        <HStack spacing={{ base: 3, md: 4 }} w="full" justify="center">
          <Link href="/">
            <Image
              width={{ base: "48px", md: "64px" }}
              height={{ base: "48px", md: "64px" }}
              src={image}
              alt="Logo"
            />
          </Link>
          <VStack alignItems="start" justifyContent="center" spacing={0} flex={1}>
            <Text
              fontWeight="bold"
              fontSize={{ base: "lg", md: "xl" }}
              lineHeight="short"
              noOfLines={1}
            >
              {title}
            </Text>
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
              noOfLines={1}
            >
              {subtitle}
            </Text>
          </VStack>
        </HStack>
      </Flex>
      <HStack spacing={{ base: 1, md: 2 }}>
        <ShareButton />
        <IconButton
          aria-label="theme toggle"
          icon={colorMode === 'light' ? <RiMoonFill /> : <RiSunLine />}
          onClick={toggleColorMode}
          size={{ base: "sm", md: "md" }}
          variant="ghost"
        />
      </HStack>
    </VStack>
  );
};

export default Header;
