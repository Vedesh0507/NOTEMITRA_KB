/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'notemitra-pdfs.s3.amazonaws.com', 'res.cloudinary.com'],
  },
};

module.exports = nextConfig;
