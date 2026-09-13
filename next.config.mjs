// Konfigurasi ini dibaca oleh vinext (Vite-based Next.js), bukan Next.js.
// Berisi opsi kompatibilitas: images.
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.rifkifauzi.id',
      },
    ],
  },
};

export default nextConfig;
