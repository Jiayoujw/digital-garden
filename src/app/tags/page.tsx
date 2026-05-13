'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface TagInfo {
  name: string;
  count: number;
  notes: { slug: string; title: string; updated: string }[];
}

export default function TagsPage() {
  const { locale } = useLanguage();
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notes')
      .then((r) => r.json())
      .then((notes: { slug: string; title: string; tags: string[]; updated: string }[]) => {
        // Aggregate tags
        const tagMap = new Map<string, TagInfo>();
        for (const note of notes) {
          if (!note.tags) continue;
          for (const t of note.tags) {
            const tag = t.trim();
            if (!tag) continue;
            if (!tagMap.has(tag)) {
              tagMap.set(tag, { name: tag, count: 0, notes: [] });
            }
            const info = tagMap.get(tag)!;
            info.count++;
            info.notes.push({ slug: note.slug, title: note.title, updated: note.updated });
          }
        }
        const sorted = Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
        setTags(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const maxCount = tags.length > 0 ? tags[0].count : 1;
  const selectedData = tags.find((t) => t.name === selectedTag);

  return (
    <div className="max-w-4xl mx-auto px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">
        {locale === 'zh' ? '标签云' : 'Tag Cloud'}
        <span className="ml-2 text-sm font-normal text-[var(--color-text-muted)]">
          ({tags.length} tags)
        </span>
      </h1>

      {tags.length === 0 ? (
        <p className="text-[var(--color-text-muted)] text-center py-12">
          {locale === 'zh' ? '暂无标签，给笔记添加标签吧' : 'No tags yet. Add tags to your notes!'}
        </p>
      ) : (
        <>
          {/* Tag cloud */}
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6 mb-8">
            <div className="flex flex-wrap gap-3 justify-center items-center">
              {tags.map((tag) => {
                const ratio = tag.count / maxCount;
                const size = 0.75 + ratio * 2;
                const opacity = 0.4 + ratio * 0.6;

                return (
                  <button
                    key={tag.name}
                    onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
                    className={`inline-block rounded-lg px-3 py-1.5 transition-all hover:scale-110 ${
                      selectedTag === tag.name
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-hover)] hover:bg-[var(--color-accent)] hover:text-white'
                    }`}
                    style={{
                      fontSize: `${size}rem`,
                      opacity,
                    }}
                  >
                    {tag.name}
                    <span className="ml-1 text-[0.6em] opacity-60">{tag.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected tag notes */}
          {selectedData && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {locale === 'zh' ? `标签: ${selectedData.name}` : `Tag: ${selectedData.name}`}
                <span className="ml-2 text-sm font-normal text-[var(--color-text-muted)]">
                  ({selectedData.count} {locale === 'zh' ? '篇笔记' : 'notes'})
                </span>
              </h2>
              <div className="space-y-2">
                {selectedData.notes
                  .sort((a, b) => b.updated.localeCompare(a.updated))
                  .map((note) => (
                    <Link
                      key={note.slug}
                      href={`/note/${note.slug}`}
                      className="block rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors group"
                    >
                      <span className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-hover)] transition-colors">
                        {note.title}
                      </span>
                      {note.updated && (
                        <span className="text-[10px] text-[var(--color-text-muted)] ml-2">
                          {new Date(note.updated).toLocaleDateString()}
                        </span>
                      )}
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
