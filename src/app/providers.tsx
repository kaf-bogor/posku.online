'use client';

import { CacheProvider } from '@chakra-ui/next-js';

import { Chakra as ChakraProvider } from '~/lib/components/Chakra';
import PresenceProvider from '~/lib/components/PresenceProvider';
import { QuizProvider } from '~/lib/context/quizContext';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <CacheProvider>
      <ChakraProvider>
        <PresenceProvider>
          <QuizProvider>{children}</QuizProvider>
        </PresenceProvider>
      </ChakraProvider>
    </CacheProvider>
  );
};

export default Providers;
