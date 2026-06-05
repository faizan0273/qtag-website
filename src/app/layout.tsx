import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { EmbedHeader } from '@/components/layout/EmbedHeader';
import { EmbedFooter } from '@/components/layout/EmbedFooter';
import { SHOPIFY_EMBED_MODE } from '@/lib/shopify-embed';
import { BRAND_LOGO_RASTER_SRC } from '@/lib/brand';
import { env } from '@/lib/env';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: `${env.NEXT_PUBLIC_BRAND_NAME}, Activate your tag`,
    template: `%s · ${env.NEXT_PUBLIC_BRAND_NAME}`,
  },
  description: 'Sign in and activate your Qtag QR sticker.',
  openGraph: {
    type: 'website',
    title: `${env.NEXT_PUBLIC_BRAND_NAME}, Tag activation`,
    siteName: env.NEXT_PUBLIC_BRAND_NAME,
    images: [{ url: BRAND_LOGO_RASTER_SRC, alt: env.NEXT_PUBLIC_BRAND_NAME }],
  },
  twitter: { card: 'summary_large_image', images: [BRAND_LOGO_RASTER_SRC] },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: BRAND_LOGO_RASTER_SRC,
  },
};

export const viewport: Viewport = {
  themeColor: '#F5F0E8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {SHOPIFY_EMBED_MODE ? <EmbedHeader /> : <Header />}
        <main className="flex-1">{children}</main>
        {SHOPIFY_EMBED_MODE ? <EmbedFooter /> : <Footer />}
      </body>
    </html>
  );
}
