'use client';

import { createContext, useState, useMemo } from 'react';
import type { FC, ReactNode } from 'react';

import { firebaseUrl } from '~/lib/context/baseUrl';

export const siteConfig = {
  title: 'POSKU Al-Fatih Bogor',
  subtitle: 'Persatuan Orang tua Santri Kuttab Al-Fatih Bogor',
  image: `${firebaseUrl}logo_posku.png?alt=media`,
};

type LayoutContextType = {
  title: string;
  subtitle: string;
  image: string;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setImage: (image: string) => void;
};

export const AppContext = createContext<LayoutContextType>({
  title: siteConfig.title,
  subtitle: siteConfig.subtitle,
  image: siteConfig.image,
  setTitle: () => {},
  setSubtitle: () => {},
  setImage: () => {},
});

type LayoutProviderProps = {
  children: ReactNode;
};

export const AppProvider: FC<LayoutProviderProps> = ({ children }) => {
  const [title, setTitle] = useState(siteConfig.title);
  const [image, setImage] = useState(siteConfig.image);
  const [subtitle, setSubtitle] = useState(siteConfig.subtitle);

  const contextValue = useMemo(
    () => ({ image, title, subtitle, setImage, setTitle, setSubtitle }),
    [image, title, subtitle]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
