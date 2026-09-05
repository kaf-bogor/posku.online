import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';

import Providers from '~/app/providers';
import { AppProvider } from '~/lib/context/app';
import { Layout } from '~/lib/layout';

type RootLayoutProps = {
  children: React.ReactNode;
};

const APP_NAME = 'poskubogor';

export const metadata: Metadata = {
  title: { default: APP_NAME, template: '%s | poskubogor' },
  description: 'Website Persatuan Orangtua Santri Kuttab Al-Fatih Bogor',
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
    url: 'https://poskubogor.com',
    title: 'poskubogor',
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
      <body style={{ minHeight: '100vh' }}>
        <Providers>
          <AppProvider>
            <Layout>{children}</Layout>
          </AppProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
