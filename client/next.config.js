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
}

module.exports = nextConfig
