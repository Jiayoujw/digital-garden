'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface NoteEditorProps {
  slug: string;
  initialContent: string;
  initialTitle: string;
  initialTags: string[];
}

export function NoteEditor({
  slug,
  initialContent,
  initialTitle,
  initialTags,
}: NoteEditorProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState(initialTags.join(', '));
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorIdx, setCursorIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const save = useCallback(
    async (titleVal: string, contentVal: string, tagsVal: string) => {
      setSaving(true);
      try {
        await fetch(`/api/notes/${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titleVal,
            content: contentVal,
            tags: tagsVal
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
          }),
        });
        setLastSaved(new Date());
      } catch {
        // silently fail
      } finally {
        setSaving(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setTags(initialTags.join(', '));
  }, [initialContent, initialTitle, initialTags, slug]);

  const debounceSave = (titleVal: string, contentVal: string, tagsVal: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(titleVal, contentVal, tagsVal), 800);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    debounceSave(title, val, tags);

    const pos = e.target.selectionStart;
    const before = val.slice(0, pos);
    const match = before.match(/\[\[([^\]\n]*)$/);
    if (match) {
      setShowSuggestions(true);
      setCursorIdx(pos);
      fetch('/api/notes')
        .then((r) => r.json())
        .then((notes: { slug: string; title: string }[]) => {
          const filtered = notes.filter((n) =>
            n.slug.startsWith(match[1].toLowerCase()) ||
            n.title.toLowerCase().includes(match[1].toLowerCase())
          );
          setSuggestions(filtered.map((n) => n.slug));
        });
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (s: string) => {
    const before = content.slice(0, cursorIdx);
    const after = content.slice(cursorIdx);
    const match = before.match(/\[\[([^\]\n]*)$/);
    if (match) {
      const newBefore = before.slice(0, before.length - match[0].length) + `[[${s}]]`;
      const newContent = newBefore + after;
      setContent(newContent);
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-1 pb-3 border-b border-[var(--color-border)] mb-3">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            debounceSave(e.target.value, content, tags);
          }}
          className="flex-1 text-xl font-bold bg-transparent border-none outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
          placeholder={t('note_title_placeholder')}
        />
        <span className="text-xs text-[var(--color-text-muted)] shrink-0">
          {saving ? t('saving') : lastSaved ? `${t('saved')} ${lastSaved.toLocaleTimeString()}` : ''}
        </span>
      </div>
      <input
        type="text"
        value={tags}
        onChange={(e) => {
          setTags(e.target.value);
          debounceSave(title, content, e.target.value);
        }}
        className="text-xs mb-3 px-1 py-1 bg-transparent border-b border-[var(--color-border)] outline-none text-[var(--color-text-secondary)] placeholder-[var(--color-text-muted)]"
        placeholder={t('tags_placeholder')}
      />
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder={t('start_writing')}
          className="w-full h-full min-h-[400px] bg-transparent border-none outline-none resize-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] leading-relaxed"
        />
        {showSuggestions && (
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-2 max-h-32 overflow-y-auto shadow-xl">
            {suggestions.length > 0 ? (
              suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  className="block w-full text-left px-3 py-1.5 text-sm rounded hover:bg-[var(--color-accent-subtle)] transition-colors"
                >
                  {s}
                </button>
              ))
            ) : (
              <p className="text-xs text-[var(--color-text-muted)] px-3 py-1">{t('type_to_search')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
