import { ToastProvider } from '@/app/components/ToastProvider';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: {
    default: 'FarmMate — The Future of Farming',
    template: '%s | FarmMate'
  },
  description: 'AI-powered farming platform with smart crop management, pest detection, and a thriving marketplace connecting farmers and buyers worldwide. Revolutionize your agriculture with FarmMate.',
  keywords: ['farming', 'agriculture', 'AI farming', 'crop management', 'pest detection', 'farm marketplace', 'smart farming', 'agricultural technology'],
  authors: [{ name: 'FarmMate Team' }],
  creator: 'FarmMate',
  publisher: 'FarmMate',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://farmmate.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://farmmate.com',
    title: 'FarmMate — The Future of Farming',
    description: 'AI-powered farming platform with smart crop management, pest detection, and a thriving marketplace connecting farmers and buyers worldwide.',
    siteName: 'FarmMate',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FarmMate — AI-Powered Farming Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FarmMate — The Future of Farming',
    description: 'AI-powered farming platform with smart crop management, pest detection, and a thriving marketplace.',
    images: ['/og-image.jpg'],
    creator: '@farmmate',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} bg-surface-900 text-surface-50 antialiased font-sans`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
