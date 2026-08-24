import type { Metadata, Viewport } from 'next';
import { Rubik, Assistant } from 'next/font/google';
import './globals.css';

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-rubik',
  display: 'swap',
});
const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-assistant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'QuestLearn',
  description: 'מסע למידה יומי עם קפי',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'QuestLearn', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#FF2A85',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} ${assistant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
