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
      bg="gray.100"
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
        p={4}
        boxShadow="md"
        backgroundColor={colorMode === 'light' ? '#FFFFFF' : '4682A9'}
      >
        <HStack
          direction="column"
          alignItems="center"
          justifyContent="start"
          gap={4}
          w="full"
        >
          <Link href="/">
            <Image width="64px" src={image} />
          </Link>
          <VStack alignItems="start" justifyContent="start" spacing={0}>
            <Text fontWeight="bold" fontSize="x-large">
              {title}
            </Text>
            <Text>{subtitle}</Text>
          </VStack>
        </HStack>
      </Flex>
      <HStack>
        <ShareButton />
        <IconButton
          aria-label="theme toggle"
          icon={colorMode === 'light' ? <RiMoonFill /> : <RiSunLine />}
          onClick={toggleColorMode}
        />
      </HStack>
    </VStack>
  );
};

export default Header;
