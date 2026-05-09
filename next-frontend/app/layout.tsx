import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Cinzel, Manrope, Great_Vibes } from 'next/font/google';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { WhatsAppWidget } from '../components/WhatsAppWidget';
import { SplashGate } from '../components/SplashGate';
import { CurrencyProvider } from '../components/CurrencyContext';
import { fetchCategories, fetchSubCategories } from '../lib/api';
import { SubCategory } from '../lib/types';
import './globals.css';
import { generateOrganizationSchema } from '../lib/schema';

// ─── Google Fonts (self-hosted by Next.js, preloaded, zero layout shift) ───
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-manrope',
  display: 'swap',
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
  display: 'swap',
});

// ─── Metadata ───────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL('https://saisatgurutextile.com'),
  title: {
    template: '%s | Sai Satguru Textile',
    default: 'Sai Satguru Textile | Wholesale Manufacturer Surat',
  },

  description: 'Premium wholesale textile manufacturer in Surat. Specializing in Kurtis, Sarees, Lehengas, and Catalog Brands.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Sai Satguru Textile | Wholesale Manufacturer Surat',
    description: 'Premium wholesale textile manufacturer in Surat.',
    type: 'website',
    images: ['/logo-512.png'],
  },
};


export const viewport: Viewport = {
  themeColor: '#050505',
};

// ─── Root Layout ─────────────────────────────────────────────────────────────
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Parallel Fetching for Initial Menu Data
  const [categories, subCategories] = await Promise.all([
    fetchCategories(),
    fetchSubCategories(),
  ]);

  const groupedSubCategories: Record<string, SubCategory[]> = {};
  subCategories.forEach((sub) => {
    if (sub.is_active === false || sub.is_active === 0 || sub.status === 'inactive') return;
    const catId = sub.category_id;
    if (catId) {
      if (!groupedSubCategories[catId]) groupedSubCategories[catId] = [];
      groupedSubCategories[catId].push(sub);
    }
  });

  const orgSchema = generateOrganizationSchema();

  // Compose font class string once
  const fontClasses = [
    playfair.variable,
    cinzel.variable,
    manrope.variable,
    greatVibes.variable,
  ].join(' ');

  return (
    <html lang="en" className={`no-scrollbar ${fontClasses}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body>
        <CurrencyProvider>
          <SplashGate alreadySeen={false}>
            <Navbar categories={categories} groupedSubCategories={groupedSubCategories} />
            <WhatsAppWidget />
            <main>
              {children}
            </main>
            <Footer />
          </SplashGate>
        </CurrencyProvider>
      </body>
    </html>
  );
}
