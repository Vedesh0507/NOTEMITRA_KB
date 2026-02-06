/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'notemitra-pdfs.s3.amazonaws.com', 'res.cloudinary.com'],
    minimumCacheTTL: 60 * 60, // Cache images for 1 hour
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || '',
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Reduce JavaScript bundle size
  swcMinify: true,
  // Enable response compression
  compress: true,
  // Generate ETags for caching
  generateEtags: true,
  // Optimize page loading
  poweredByHeader: false,
  // PWA headers for service worker
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800', // Cache for 1 week
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
