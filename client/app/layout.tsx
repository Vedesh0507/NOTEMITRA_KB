import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import Navbar from '@/components/Navbar';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NoteMitra - Student Notes Sharing Platform',
  description: 'Share and discover academic notes with students and teachers',
  keywords: 'notes, education, study, college, university, sharing',
  authors: [{ name: 'NoteMitra Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NoteMitra',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NoteMitra" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="NoteMitra" />
        <meta name="msapplication-TileColor" content="#2563eb" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <AuthProvider>
          <Navbar />
          <main id="main-content" role="main">
            {children}
          </main>
          <PWAInstallPrompt />
          <ServiceWorkerRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
