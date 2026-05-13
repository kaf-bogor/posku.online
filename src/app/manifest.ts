import type { MetadataRoute } from 'next';

const manifest = (): MetadataRoute.Manifest => ({
  short_name: 'poskubogor',
  name: 'Persatuan Orangtua Santri Kuttab Al-Fatih Bogor',
  lang: 'en',
  start_url: '/',
  background_color: '#FFFFFF',
  theme_color: '#FFFFFF',
  dir: 'ltr',
  display: 'standalone',
  prefer_related_applications: false,
  icons: [
    {
      src: 'https://gtxkitey0g3yotdg.public.blob.vercel-storage.com/logo_posku.png?alt=media',
      type: 'image/png',
      sizes: '512x512',
    },
  ],
});

export default manifest;
