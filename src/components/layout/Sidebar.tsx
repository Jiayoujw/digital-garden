'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { NoteSummary } from '@/lib/types';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '◆' },
  { href: '/graph', label: 'Graph', icon: '◎' },
  { href: '/daily', label: 'Daily', icon: '◷' },
  { href: '/clusters', label: 'Clusters', icon: '⬡' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/notes')
      .then((r) => r.json())
      .then(setNotes)
      .catch(() => {});
  }, [pathname]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleCreate = async () => {
    const title = prompt('Note title:');
    if (!title) return;
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content: '', tags: [] }),
    });
    if (res.ok) {
      const note = await res.json();
      router.push(`/note/${note.slug}`);
    }
  };

  return (
    <aside className="w-64 h-full bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col shrink-0">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h1 className="text-lg font-bold tracking-tight">
          <Link href="/" className="hover:text-[var(--color-accent-hover)] transition-colors">
            🌱 Digital Garden
          </Link>
        </h1>
      </div>

      <nav className="p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === item.href
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-hover)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <span className="text-xs">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-2">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full px-3 py-1.5 text-sm rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
        />
      </div>

      <div className="px-3 pb-2">
        <button
          onClick={handleCreate}
          className="w-full px-3 py-1.5 text-sm rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          + New Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-1">
          Recent Notes
        </p>
        <ul className="space-y-0.5">
          {notes.slice(0, 20).map((note) => (
            <li key={note.slug}>
              <Link
                href={`/note/${note.slug}`}
                className={`block px-3 py-1.5 rounded-lg text-sm truncate transition-colors ${
                  pathname === `/note/${note.slug}`
                    ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-hover)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {note.title}
              </Link>
            </li>
          ))}
          {notes.length === 0 && (
            <p className="text-xs text-[var(--color-text-muted)] px-3 py-2">
              No notes yet. Create one!
            </p>
          )}
        </ul>
      </div>
    </aside>
  );
}
