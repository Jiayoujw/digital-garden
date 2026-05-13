import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { Providers } from '@/components/layout/Providers';
import { ServiceWorker } from '@/components/shared/ServiceWorker';

export const metadata: Metadata = {
  title: {
    default: 'Digital Garden',
    template: '%s | Digital Garden',
  },
  description: 'Personal knowledge graph & second brain — grow ideas with [[wikilinks]]',
  keywords: ['digital garden', 'knowledge graph', 'notes', 'second brain', 'wikilinks'],
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'Digital Garden',
    description: 'Personal knowledge graph & second brain',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#6366f1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex overflow-hidden">
        <Providers>
          <AppShell>{children}</AppShell>
          <ServiceWorker />
        </Providers>
      </body>
    </html>
  );
}
