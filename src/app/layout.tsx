import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StoreRehydration } from '@/components/providers/StoreRehydration';
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
    default: `${env.NEXT_PUBLIC_BRAND_NAME}, Smart safety in Pakistan`,
    template: `%s, ${env.NEXT_PUBLIC_BRAND_NAME}`,
  },
  description:
    'Smart safety in Pakistan: physical and digital QR tags you control. Share the right information at the right moment without exposing private numbers.',
  openGraph: {
    type: 'website',
    title: `${env.NEXT_PUBLIC_BRAND_NAME}, Smart safety for everyone in Pakistan`,
    description:
      'Privacy first QR tags for vehicles, bags, entryways, and more, built for Pakistan. You choose what each scan shows.',
    siteName: env.NEXT_PUBLIC_BRAND_NAME,
    images: [{ url: BRAND_LOGO_RASTER_SRC, alt: env.NEXT_PUBLIC_BRAND_NAME }],
  },
  twitter: { card: 'summary_large_image', images: [BRAND_LOGO_RASTER_SRC] },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: BRAND_LOGO_RASTER_SRC,
  },
};

export const viewport: Viewport = {
  themeColor: '#FBFAF6',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="min-h-screen flex flex-col">
        <StoreRehydration />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
