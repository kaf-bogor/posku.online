'use client';

import { Text, VStack } from '@chakra-ui/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useContext, useEffect } from 'react';

import { AppContext, siteConfig } from '~/lib/context/app';

const TerimaKasihPage = () => {
  const { setImage, setTitle, setSubtitle } = useContext(AppContext);

  useEffect(() => {
    setTitle('');
    setImage('');
    setSubtitle('');
    return () => {
      setImage(siteConfig.image);
      setTitle(siteConfig.title);
      setSubtitle(siteConfig.subtitle);
    };
  }, [setImage, setTitle, setSubtitle]);
  return (
    <VStack>
      <DotLottieReact
        src="https://lottie.host/840d4f64-945b-4baa-8be2-c39d482551e1/l2Tu90mekO.lottie"
        loop
        autoplay
      />
      <Text fontSize="4xl" align="center">
        Terima kasih
      </Text>
      <Text fontSize="2xl" align="center">
        atas donasi yang telah Anda berikan. Semoga Allah membalas dengan
        keberkahan dan pahala yang berlipat
      </Text>
    </VStack>
  );
};

export default TerimaKasihPage;
