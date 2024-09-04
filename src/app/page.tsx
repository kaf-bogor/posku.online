import { Button, HStack, Tooltip, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { type IconType } from 'react-icons';
import { CiInstagram } from 'react-icons/ci';
import { FaWhatsapp } from 'react-icons/fa';
import { TbWorldWww } from 'react-icons/tb';

const getIconComponent = (iconName: string): IconType | null => {
  switch (iconName) {
    case 'CiInstagram':
      return CiInstagram;
    case 'FaWhatsapp':
      return FaWhatsapp;
    case 'TbWorldWww':
      return TbWorldWww;
    default:
      return null;
  }
};

// Server component
const Home = async () => {
  let topBarLinks: TopBarLink[] = [];
  let mainLinks: MainLink[] = [];

  try {
    // Fetch top bar links from the API
    const topBarResponse = await fetch(
      'https://sheetdb.io/api/v1/8xqlqnv3dqkq5'
    );
    topBarLinks = await topBarResponse.json();

    // Fetch main links from the API
    const mainLinksResponse = await fetch(
      'https://sheetdb.io/api/v1/sod520fi1w5bh'
    );
    mainLinks = await mainLinksResponse.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching links:', error);
  }

  return (
    <>
      <HStack mb={6} mt={4} gap={6}>
        {topBarLinks.map(({ href, icon: iconName, label }) => {
          const IconComponent = getIconComponent(iconName);
          return (
            <Tooltip
              key={href}
              hasArrow
              aria-label={label}
              label={label}
              placement="bottom"
            >
              <Link href={href}>
                {IconComponent ? <IconComponent size="32px" /> : null}
              </Link>
            </Tooltip>
          );
        })}
      </HStack>
      <VStack gap={[6, 3]}>
        {mainLinks.map(({ href, label }) => (
          <Link href={href} key={href}>
            <Button w={['90vw', '400px']}>{label}</Button>
          </Link>
        ))}
      </VStack>
    </>
  );
};

export default Home;

type TopBarLink = {
  href: string;
  icon: string;
  name: string;
  label: string;
};

type MainLink = { href: string; label: string };
