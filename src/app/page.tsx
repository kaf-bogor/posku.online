'use client';

import { FaUsers, FaEnvelopeOpenText, FaRegFileAlt } from 'react-icons/fa';

import { storageUrl } from '~/lib/context/baseUrl';

import MainMenus from './components/MainMenus';

const Home = () => {
  return (
    <MainMenus
      items={[
        {
          label: 'Tentang POSKU',
          href: '/tentang',
          imageUrl: `${storageUrl}/logo_posku.png?alt=media`,
        },
        {
          label: 'Muslimah Center',
          href: '/muslimah_center',
          imageUrl: `${storageUrl}/mc_light.png?alt=media`,
        },
        {
          label: 'Pengurus',
          href: '/pengurus',
          icon: FaUsers,
        },
        {
          label: 'Newsletter',
          href: '/newsletter',
          icon: FaEnvelopeOpenText,
        },

        {
          label: 'Laporan',
          href: '/reports',
          icon: FaRegFileAlt,
        },
      ]}
    />
  );
};

export default Home;
