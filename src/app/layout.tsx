import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';

import Providers from '~/app/providers';
import { AppProvider } from '~/lib/context/app';
import { Layout } from '~/lib/layout';

type RootLayoutProps = {
  children: React.ReactNode;
};

const APP_NAME = 'Posku Online';

export const metadata: Metadata = {
  title: { default: APP_NAME, template: '%s | Posku-online' },
  description: 'Next.js + chakra-ui + TypeScript template',
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    url: 'https://posku.online',
    title: 'Posku Online',
    description: 'Website Persatuan Orangtua Santri Kuttab Al-Fatih Bogor',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFFFFF',
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="id">
      <script src="https://static.elfsight.com/platform/platform.js" async />

      <body style={{ minHeight: '100vh' }}>
        <Providers>
          <AppProvider>
            <Layout>{children}</Layout>
          </AppProvider>
        </Providers>
        <Analytics />
        <div
          className="elfsight-app-e7956b46-b692-49aa-9de8-dab32f9350be"
          data-elfsight-app-lazy
        />
      </body>
    </html>
  );
};

export default RootLayout;
