import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Providers } from '@/components/layout/Providers';

export const metadata: Metadata = {
  title: 'Digital Garden',
  description: 'Personal knowledge graph & second brain',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex overflow-hidden">
        <Providers>
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[var(--color-bg-primary)]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
