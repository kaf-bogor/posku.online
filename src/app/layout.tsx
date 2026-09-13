import type { Metadata, Viewport } from 'next';

import ServiceWorkerCleanup from '~/app/components/ServiceWorkerCleanup';
import Providers from '~/app/providers';
import { AppProvider } from '~/lib/context/app';
import { Layout } from '~/lib/layout';

type RootLayoutProps = {
  children: React.ReactNode;
};

const APP_NAME = 'poskubogor';
const CF_ANALYTICS_TOKEN =
  process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN ||
  '315ac31b5a594fafbae561ca64e15029';

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
  maximumScale: 1,
  userScalable: false,
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
        <ServiceWorkerCleanup />
        {CF_ANALYTICS_TOKEN ? (
          <script
            async
            type="module"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: CF_ANALYTICS_TOKEN })}
          />
        ) : null}
      </body>
    </html>
  );
};

export default RootLayout;
