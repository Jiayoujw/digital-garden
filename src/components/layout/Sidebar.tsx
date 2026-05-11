'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { NoteSummary } from '@/lib/types';

export function Sidebar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const navItems = [
    { href: '/', label: t('home'), icon: '◆' },
    { href: '/graph', label: t('graph'), icon: '◎' },
    { href: '/daily', label: t('daily'), icon: '◷' },
    { href: '/clusters', label: t('clusters'), icon: '⬡' },
  ];

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
    const title = newTitle.trim();
    if (!title) return;
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content: '', tags: [] }),
    });
    if (res.ok) {
      const note = await res.json();
      setShowCreateModal(false);
      setNewTitle('');
      router.push(`/note/${note.slug}`);
    }
  };

  return (
    <aside className="w-64 h-full bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col shrink-0">
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">
            <Link href="/" className="hover:text-[var(--color-accent-hover)] transition-colors">
              {t('digital_garden')}
            </Link>
          </h1>
          <LanguageSwitcher />
        </div>
      </div>

      <nav className="p-3 space-y-0.5">
        {navItems.map((item) => (
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
          placeholder={t('search_notes')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full px-3 py-1.5 text-sm rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
        />
      </div>

      <div className="px-3 pb-2">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full px-3 py-1.5 text-sm rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          {t('new_note')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-1">
          {t('recent_notes')}
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
              {t('no_notes_yet')}
            </p>
          )}
        </ul>
      </div>

      {showCreateModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6 w-80 shadow-2xl">
            <h2 className="text-lg font-semibold mb-4">{t('create_note')}</h2>
            <input
              type="text"
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreateModal(false); }}
              placeholder={t('note_title_prompt')}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => { setShowCreateModal(false); setNewTitle(''); }}
                className="px-4 py-1.5 rounded-lg text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-1.5 rounded-lg text-sm bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                {t('create_note')}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
