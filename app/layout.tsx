import type { Metadata, Viewport } from 'next';
import { preload } from 'react-dom';
import { Anybody, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import { srcSet } from '@/components/Img';
import { brand } from '@/lib/content';
import './globals.css';

// Anybody: variable width 50–150 — set wide and thin for an automotive, extended display face.
const display = Anybody({ subsets: ['latin'], axes: ['wdth'], variable: '--font-display', display: 'swap' });
const sans = Instrument_Sans({ subsets: ['latin'], axes: ['wdth'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.line}, ${brand.area}`,
  description: `${brand.name}: paint correction, ceramic coatings, PPF and interior detailing in ${brand.area}. A fictional studio design concept.`,
};

export const viewport: Viewport = { themeColor: '#09090B', width: 'device-width', initialScale: 1, colorScheme: 'dark' };

const motionFlag = `try{if(matchMedia('(prefers-reduced-motion: no-preference)').matches){document.documentElement.classList.add('motion');document.documentElement.classList.add('is-intro')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  preload('/img/hero-1600.avif', { as: 'image', imageSrcSet: srcSet('hero', 'avif'), imageSizes: '100vw', type: 'image/avif', fetchPriority: 'high' });
  return (
    // suppressHydrationWarning: the inline script adds `motion` to <html> before hydration.
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
