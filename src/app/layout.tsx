import type { Metadata, Viewport } from 'next';

import Providers from '~/app/providers';
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
    <html lang="en">
      <script async src="https://cdn.pushengage.com/pushengage.js" />
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
