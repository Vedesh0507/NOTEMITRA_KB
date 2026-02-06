/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['lh3.googleusercontent.com', 'notemitra-pdfs.s3.amazonaws.com', 'res.cloudinary.com'],
  },
  experimental: {
    outputFileTracingIgnores: ['**canvas**', '**pdfjs-dist**'],
  },
};

module.exports = nextConfig;
