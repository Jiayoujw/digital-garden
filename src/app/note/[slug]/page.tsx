'use client';

import { useState, useEffect, use } from 'react';
import { NoteEditor } from '@/components/note/NoteEditor';
import { NotePreview } from '@/components/note/NotePreview';
import { BacklinksPanel } from '@/components/note/BacklinksPanel';
import { TagList } from '@/components/note/TagList';
import type { Note } from '@/lib/types';

export default function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/notes/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setNote(null);
        } else {
          setNote(data);
        }
      })
      .catch(() => setNote(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-[var(--color-text-muted)] text-lg">Note not found</p>
        <p className="text-[var(--color-text-muted)] text-sm">
          The note &quot;{slug}&quot; doesn&apos;t exist yet.
        </p>
        <a
          href="/"
          className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors text-sm"
        >
          Go Home
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setMode('edit')}
          className={`px-3 py-1 rounded-lg text-xs transition-colors ${
            mode === 'edit'
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setMode('preview')}
          className={`px-3 py-1 rounded-lg text-xs transition-colors ${
            mode === 'preview'
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setMode('split')}
          className={`px-3 py-1 rounded-lg text-xs transition-colors ${
            mode === 'split'
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          Split
        </button>
      </div>

      {mode === 'edit' && (
        <div className="flex-1">
          <NoteEditor
            slug={note.slug}
            initialContent={note.content}
            initialTitle={note.frontmatter.title}
            initialTags={note.frontmatter.tags}
          />
        </div>
      )}
      {mode === 'preview' && (
        <div className="flex-1 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">{note.frontmatter.title}</h1>
          <TagList tags={note.frontmatter.tags} />
          <div className="mt-4">
            <NotePreview content={note.content} />
          </div>
        </div>
      )}
      {mode === 'split' && (
        <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
          <div className="overflow-hidden">
            <NoteEditor
              slug={note.slug}
              initialContent={note.content}
              initialTitle={note.frontmatter.title}
              initialTags={note.frontmatter.tags}
            />
          </div>
          <div className="overflow-y-auto">
            <h1 className="text-xl font-bold mb-3">{note.frontmatter.title}</h1>
            <TagList tags={note.frontmatter.tags} />
            <div className="mt-4">
              <NotePreview content={note.content} />
            </div>
          </div>
        </div>
      )}

      <BacklinksPanel slug={slug} />
    </div>
  );
}
