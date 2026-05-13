'use client';

import { useState, useCallback, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ReadingProgress } from '@/components/shared/ReadingProgress';
import { CommandPalette } from '@/components/shared/CommandPalette';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [children]);

  const handleClose = useCallback(() => setSidebarOpen(false), []);

  return (
    <>
      <ReadingProgress />
      <CommandPalette />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Sidebar — fixed on mobile, static on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:relative lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar onCloseMobile={handleClose} />
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-3 left-3 z-30 w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <main className="flex-1 overflow-y-auto bg-[var(--color-bg-primary)]">
        {children}
      </main>

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 right-4 z-30 hidden lg:block">
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' }));
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          <kbd className="text-[10px] bg-[var(--color-bg-tertiary)] px-1 py-0.5 rounded border border-[var(--color-border)]">
            Ctrl+K
          </kbd>
          <span>Command Palette</span>
        </button>
      </div>
    </>
  );
}
