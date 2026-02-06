/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'notemitra-pdfs.s3.amazonaws.com', 'res.cloudinary.com'],
    minimumCacheTTL: 60 * 60,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || '',
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  swcMinify: true,
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
}

module.exports = nextConfig
