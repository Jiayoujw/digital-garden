'use client';

import { useState, useEffect, use } from 'react';
import { NoteEditor } from '@/components/note/NoteEditor';
import { NotePreview } from '@/components/note/NotePreview';
import { BacklinksPanel } from '@/components/note/BacklinksPanel';
import { TagList } from '@/components/note/TagList';
import { VersionHistory } from '@/components/note/VersionHistory';
import { SuggestedLinks } from '@/components/note/SuggestedLinks';
import { NoteSidebar } from '@/components/note/NoteSidebar';
import { ExportButton } from '@/components/shared/ExportButton';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Note } from '@/lib/types';

export default function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { t } = useLanguage();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [versionKey, setVersionKey] = useState(0);

  const handleVersionRestore = async (content: string) => {
    await fetch(`/api/notes/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: note?.frontmatter.title ?? slug,
        content,
        tags: note?.frontmatter.tags ?? [],
      }),
    });
    // Reload note data and force editor remount
    const res = await fetch(`/api/notes/${slug}`);
    const data = await res.json();
    if (!data.error) setNote(data);
    setVersionKey((k) => k + 1);
  };

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
        <p className="text-[var(--color-text-muted)] text-lg">{t('note_not_found')}</p>
        <p className="text-[var(--color-text-muted)] text-sm">
          {t('note_not_found_desc', { slug })}
        </p>
        <a
          href="/"
          className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors text-sm"
        >
          {t('go_home')}
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {(['edit', 'preview', 'split'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                mode === m
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {t(m)}
            </button>
          ))}
        </div>
        {note && (
          <ExportButton
            title={note.frontmatter.title}
            content={note.rawContent || note.content}
            slug={note.slug}
          />
        )}
      </div>

      {/* Always mount editor — hidden in preview mode — so state survives mode switches */}
      <div className={mode === 'preview' ? 'hidden' : mode === 'split' ? 'flex-1 grid grid-cols-2 gap-6 overflow-hidden' : 'flex-1'}>
        <div className="overflow-hidden">
          <NoteEditor
            key={`${note.slug}-${versionKey}`}
            slug={note.slug}
            initialContent={note.content}
            initialTitle={note.frontmatter.title}
            initialTags={note.frontmatter.tags}
          />
        </div>
        {mode === 'split' && (
          <div className="flex gap-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <h1 className="text-xl font-bold mb-3">{note.frontmatter.title}</h1>
              <TagList tags={note.frontmatter.tags} />
              <div className="mt-4">
                <NotePreview content={note.content} />
              </div>
            </div>
            <NoteSidebar content={note.content} />
          </div>
        )}
      </div>
      {mode === 'preview' && (
        <div className="flex-1 flex gap-6 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4">{note.frontmatter.title}</h1>
            <TagList tags={note.frontmatter.tags} />
            <div className="mt-4">
              <NotePreview content={note.content} />
            </div>
          </div>
          <NoteSidebar content={note.content} />
        </div>
      )}

      <BacklinksPanel slug={slug} />
      <SuggestedLinks slug={slug} />
      <VersionHistory
        slug={slug}
        currentContent={note.content}
        onRestore={handleVersionRestore}
      />
    </div>
  );
}
