'use client';

import { createContext, useState, useMemo } from 'react';
import type { FC, ReactNode } from 'react';

import { firebaseUrl } from '~/lib/context/baseUrl';

type LayoutContextType = {
  title: string;
  subtitle: string;
  image: string;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setImage: (image: string) => void;
};

export const AppContext = createContext<LayoutContextType>({
  title: 'POSKU Al-Fatih Bogor',
  subtitle: 'Persatuan Orangtua Santri Kuttab Al-Fatih Bogor',
  image: `${firebaseUrl}logo_posku.png?alt=media`,
  setTitle: () => {},
  setSubtitle: () => {},
  setImage: () => {},
});

type LayoutProviderProps = {
  children: ReactNode;
};

export const AppProvider: FC<LayoutProviderProps> = ({ children }) => {
  const [title, setTitle] = useState('POSKU Al-Fatih Bogor');
  const [image, setImage] = useState(`${firebaseUrl}logo_posku.png?alt=media`);
  const [subtitle, setSubtitle] = useState(
    'Persatuan Orangtua Santri Kuttab Al-Fatih Bogor'
  );

  const contextValue = useMemo(
    () => ({ image, title, subtitle, setImage, setTitle, setSubtitle }),
    [image, title, subtitle]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
