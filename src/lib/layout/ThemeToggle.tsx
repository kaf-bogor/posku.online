import { IconButton, useColorMode } from '@chakra-ui/react';
import { RiMoonFill, RiSunLine } from 'react-icons/ri';

import ShareButton from '~/lib/components/ShareButton';

const ThemeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <>
      <ShareButton />
      <IconButton
        aria-label="theme toggle"
        icon={colorMode === 'light' ? <RiMoonFill /> : <RiSunLine />}
        onClick={toggleColorMode}
      />
    </>
  );
};

export default ThemeToggle;
