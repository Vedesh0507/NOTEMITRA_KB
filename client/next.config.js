/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['lh3.googleusercontent.com', 'notemitra-pdfs.s3.amazonaws.com', 'res.cloudinary.com'],
  },
  serverExternalPackages: ['pdfjs-dist', 'canvas', 'sharp'],
  webpack: (config, { isServer }) => {
    // Exclude canvas from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
