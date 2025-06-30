import { Flex } from '@chakra-ui/react';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <Flex as="header" width="full" align="center" justify="space-between" p={6}>
      <ThemeToggle />
    </Flex>
  );
};

export default Header;
