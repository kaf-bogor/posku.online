'use client';

import { useColorModeValue } from '@chakra-ui/react';
import { createContext, useState, useMemo } from 'react';
import type { FC, ReactNode } from 'react';

import { storageUrl } from '~/lib/context/baseUrl';

export const siteConfig = {
  title: 'POSKU Al-Fatih Bogor',
  subtitle: 'Persatuan Orang tua Santri Kuttab Al-Fatih Bogor',
  image: `${storageUrl}/logo_posku.png?alt=media`,
  isDisplayPromo: false,
  bgColor: 'white',
  borderColor: 'gray.200',
  textColor: 'black',
};

type LayoutContextType = {
  title: string;
  subtitle: string;
  image: string;
  isDisplayPromo: boolean;
  bgColor: string;
  borderColor: string;
  textColor: string;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setImage: (image: string) => void;
  setIsDisplayPromo: (status: boolean) => void;
};

export const AppContext = createContext<LayoutContextType>({
  title: siteConfig.title,
  subtitle: siteConfig.subtitle,
  image: siteConfig.image,
  isDisplayPromo: siteConfig.isDisplayPromo,
  bgColor: siteConfig.bgColor,
  borderColor: siteConfig.borderColor,
  textColor: siteConfig.textColor,
  setTitle: () => {},
  setSubtitle: () => {},
  setImage: () => {},
  setIsDisplayPromo: () => {},
});

type LayoutProviderProps = {
  children: ReactNode;
};

export const AppProvider: FC<LayoutProviderProps> = ({ children }) => {
  const [title, setTitle] = useState(siteConfig.title);
  const [image, setImage] = useState(siteConfig.image);
  const [subtitle, setSubtitle] = useState(siteConfig.subtitle);
  const [isDisplayPromo, setIsDisplayPromo] = useState(
    siteConfig.isDisplayPromo
  );

  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('black', 'gray.100');

  const contextValue = useMemo(
    () => ({
      bgColor,
      borderColor,
      textColor,
      image,
      isDisplayPromo,
      title,
      subtitle,
      setImage,
      setIsDisplayPromo,
      setTitle,
      setSubtitle,
    }),
    [bgColor, borderColor, textColor, image, isDisplayPromo, title, subtitle]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
