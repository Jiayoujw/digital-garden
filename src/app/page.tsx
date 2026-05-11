'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/layout/SearchBar';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { NoteSummary } from '@/lib/types';

export default function HomePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [stats, setStats] = useState({ notes: 0, links: 0, clusters: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetch('/api/notes').then((r) => r.json()).then(setNotes).catch(() => {});
    fetch('/api/graph')
      .then((r) => r.json())
      .then((d) => setStats((s) => ({ ...s, links: d.links?.length ?? 0 })))
      .catch(() => {});
    fetch('/api/clusters')
      .then((r) => r.json())
      .then((d) => setStats((s) => ({ ...s, clusters: d.length ?? 0 })))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setStats((s) => ({ ...s, notes: notes.length }));
  }, [notes]);

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
    <div className="max-w-4xl mx-auto px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">{t('my_digital_garden')}</h1>
        <p className="text-[var(--color-text-secondary)] mb-6">
          {t('garden_subtitle')}
        </p>
        <SearchBar large />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <Link
          href="/graph"
          className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
        >
          <div className="text-2xl font-bold text-[var(--color-accent-hover)]">{stats.notes}</div>
          <div className="text-sm text-[var(--color-text-secondary)]">{t('notes')}</div>
        </Link>
        <Link
          href="/graph"
          className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
        >
          <div className="text-2xl font-bold text-[var(--color-accent-hover)]">{stats.links}</div>
          <div className="text-sm text-[var(--color-text-secondary)]">{t('connections')}</div>
        </Link>
        <Link
          href="/clusters"
          className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
        >
          <div className="text-2xl font-bold text-[var(--color-accent-hover)]">{stats.clusters}</div>
          <div className="text-sm text-[var(--color-text-secondary)]">{t('clusters')}</div>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t('recent_notes')}</h2>
        <Link
          href={`/daily/${today}`}
          className="text-sm text-[var(--color-accent-hover)] hover:underline"
        >
          {t('todays_note')}
        </Link>
      </div>

      <div className="space-y-2">
        {notes.slice(0, 10).map((note) => (
          <Link
            key={note.slug}
            href={`/note/${note.slug}`}
            className="block p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{note.title}</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {new Date(note.updated).toLocaleDateString()}
              </span>
            </div>
            {note.tags.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
        {notes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[var(--color-text-muted)] text-lg mb-2">
              {t('your_garden_empty')}
            </p>
            <p className="text-[var(--color-text-muted)] text-sm mb-4">
              {t('garden_empty_desc')}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              {t('create_first_note')}
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
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
    </div>
  );
}
