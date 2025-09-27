'use client';

import { CacheProvider } from '@chakra-ui/next-js';

import { Chakra as ChakraProvider } from '~/lib/components/Chakra';
import { QuizProvider } from '~/lib/context/quizContext';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <CacheProvider>
      <ChakraProvider>
        <QuizProvider>{children}</QuizProvider>
      </ChakraProvider>
    </CacheProvider>
  );
};

export default Providers;
