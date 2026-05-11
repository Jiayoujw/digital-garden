'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/layout/SearchBar';
import type { NoteSummary } from '@/lib/types';

export default function HomePage() {
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [stats, setStats] = useState({ notes: 0, links: 0, clusters: 0 });
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

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">My Digital Garden</h1>
        <p className="text-[var(--color-text-secondary)] mb-6">
          A non-linear space for growing ideas. Write notes, link them with
          [[wikilinks]], and watch your knowledge graph emerge.
        </p>
        <SearchBar large />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <Link
          href="/graph"
          className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
        >
          <div className="text-2xl font-bold text-[var(--color-accent-hover)]">{stats.notes}</div>
          <div className="text-sm text-[var(--color-text-secondary)]">Notes</div>
        </Link>
        <Link
          href="/graph"
          className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
        >
          <div className="text-2xl font-bold text-[var(--color-accent-hover)]">{stats.links}</div>
          <div className="text-sm text-[var(--color-text-secondary)]">Connections</div>
        </Link>
        <Link
          href="/clusters"
          className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
        >
          <div className="text-2xl font-bold text-[var(--color-accent-hover)]">{stats.clusters}</div>
          <div className="text-sm text-[var(--color-text-secondary)]">Clusters</div>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Notes</h2>
        <Link
          href={`/daily/${today}`}
          className="text-sm text-[var(--color-accent-hover)] hover:underline"
        >
          Today&apos;s Note →
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
              Your garden is empty
            </p>
            <p className="text-[var(--color-text-muted)] text-sm mb-4">
              Create your first note to start growing your knowledge graph
            </p>
            <button
              onClick={() => {
                const title = prompt('Note title:');
                if (title) {
                  fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content: '', tags: [] }),
                  })
                    .then((r) => r.json())
                    .then((note) => {
                      window.location.href = `/note/${note.slug}`;
                    });
                }
              }}
              className="px-5 py-2.5 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Create First Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
