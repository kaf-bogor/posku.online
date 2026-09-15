import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';

import ServiceWorkerCleanup from '~/app/components/ServiceWorkerCleanup';
import TurnstileGate from '~/app/components/TurnstileGate';
import Providers from '~/app/providers';
import { AppProvider } from '~/lib/context/app';
import { Layout } from '~/lib/layout';
import { GATE_COOKIE, verifyGate } from '~/lib/turnstile';

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

const RootLayout = async ({ children }: RootLayoutProps) => {
  const store = await cookies();
  const passed = await verifyGate(store.get(GATE_COOKIE)?.value);

  return (
    <html lang="id" suppressHydrationWarning>
      <body style={{ minHeight: '100vh' }} suppressHydrationWarning>
        <Providers>
          <AppProvider>
            {passed ? <Layout>{children}</Layout> : <TurnstileGate />}
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
