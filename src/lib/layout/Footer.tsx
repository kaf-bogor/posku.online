'use client';

import { Flex, Link, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <Flex as="footer" width="full" justifyContent="center">
      <Text fontSize="sm">
        {currentYear || '2024'} -{' '}
        <Link
          href="https://poskubogor.com"
          isExternal
          rel="noopener noreferrer"
        >
          Posku KAF Bogor
        </Link>
      </Text>
    </Flex>
  );
};

export default Footer;
