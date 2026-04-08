import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import Nav from '@/components/nav';
import Header from '@/components/header';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-headline',
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  display: 'swap',
});

const beVietnam = Be_Vietnam_Pro({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PaddleUp | Track Your Pickleball Game',
  description: 'Track games, climb the leaderboard, earn badges. Your pickleball group, levelled up.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${beVietnam.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh pb-28">
        <Header />
        <main className="pt-20 px-5 max-w-2xl mx-auto">
          {children}
        </main>
        <Nav />
      </body>
    </html>
  );
}
