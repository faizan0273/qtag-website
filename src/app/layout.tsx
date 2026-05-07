import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StoreRehydration } from '@/components/providers/StoreRehydration';
import { env } from '@/lib/env';
import './globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: `${env.NEXT_PUBLIC_BRAND_NAME} — A QR sticker for your car. Your number stays private.`,
    template: `%s · ${env.NEXT_PUBLIC_BRAND_NAME}`,
  },
  description:
    'Stick a QR on your windshield. If anyone needs to reach you about your car, they message you on WhatsApp — without ever seeing your number.',
  openGraph: {
    type: 'website',
    title: `${env.NEXT_PUBLIC_BRAND_NAME} — Your number stays private`,
    description:
      'A simple QR sticker for your car. Strangers can reach you on WhatsApp without seeing your phone number.',
    siteName: env.NEXT_PUBLIC_BRAND_NAME,
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#FBFAF6',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen flex flex-col">
        <StoreRehydration />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
