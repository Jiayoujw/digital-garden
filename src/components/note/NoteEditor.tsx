'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { VoiceInput } from '@/components/shared/VoiceInput';
import { Sparkles, FileText, MoveRight, Languages } from 'lucide-react';
import { useAutoSave } from '@/lib/useAutoSave';

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
  const { t, locale } = useLanguage();
  const [title, setTitleState] = useState(initialTitle);
  const [tags, setTags] = useState(initialTags.join(', '));
  const [saving, setSaving] = useState(false);
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleLatestRef = useRef({ title: initialTitle, tags: initialTags.join(', ') });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [cursorIdx, setCursorIdx] = useState(0);

  // AI assistant state
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiToolbar, setShowAiToolbar] = useState(false);
  const [aiSelection, setAiSelection] = useState<{ text: string; start: number; end: number } | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // ── Local-first persistence for content ──
  const saveContentToServer = useCallback(
    async (contentVal: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/notes/${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titleLatestRef.current.title,
            content: contentVal,
            tags: titleLatestRef.current.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          }),
          keepalive: true,
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    [slug]
  );

  const {
    content,
    status: contentStatus,
    lastSavedAt,
    setContent,
    saveNow,
    restoredFromBackup,
  } = useAutoSave({
    storageKey: `garden-draft-${slug}`,
    initialContent,
    saveToServer: saveContentToServer,
  });

  // ── Title/tags save (secondary — debounced server save) ──
  const saveTitleAndTags = useCallback(
    async (titleVal: string, tagsVal: string) => {
      try {
        await fetch(`/api/notes/${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titleVal,
            content,
            tags: tagsVal
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          }),
          keepalive: true,
        });
      } catch {
        // silently fail
      }
    },
    [slug, content]
  );

  const debounceTitle = (titleVal: string, tagsVal: string) => {
    titleLatestRef.current = { title: titleVal, tags: tagsVal };
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(() => saveTitleAndTags(titleVal, tagsVal), 800);
  };

  // Cleanup title timer on unmount
  useEffect(() => {
    return () => {
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    };
  }, []);

  // Reset title/tags when note changes
  useEffect(() => {
    setTitleState(initialTitle);
    setTags(initialTags.join(', '));
    titleLatestRef.current = { title: initialTitle, tags: initialTags.join(', ') };
  }, [slug, initialTitle]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived saving state ──
  useEffect(() => {
    if (contentStatus === 'saving') setSaving(true);
    else setSaving(false);
  }, [contentStatus]);

  // ── AI assistant ──
  const handleSelect = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) {
      setShowAiToolbar(false);
      setAiSelection(null);
      return;
    }
    const selectedText = content.slice(start, end).trim();
    if (selectedText.length < 2) {
      setShowAiToolbar(false);
      setAiSelection(null);
      return;
    }
    setAiSelection({ text: selectedText, start, end });
    setShowAiToolbar(true);
  }, [content]);

  const handleAiAction = useCallback(
    async (action: string) => {
      if (!aiSelection) return;
      setShowAiToolbar(false);
      setAiLoading(true);
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: aiSelection.text,
            action,
            language: locale,
          }),
        });
        const data = await res.json();
        if (data.text) {
          const newContent =
            content.slice(0, aiSelection.start) +
            '\n\n' +
            data.text.trim() +
            '\n\n' +
            content.slice(aiSelection.end);
          setContent(newContent);
          requestAnimationFrame(() => {
            const ta = textareaRef.current;
            if (ta) {
              const newPos = aiSelection.start + data.text.trim().length + 4;
              ta.focus();
              ta.setSelectionRange(newPos, newPos);
            }
          });
        }
      } catch {
        // silently fail
      } finally {
        setAiLoading(false);
      }
    },
    [aiSelection, content, setContent, locale]
  );

  // Voice input
  const handleVoiceTranscript = useCallback(
    (text: string) => {
      const ta = textareaRef.current;
      const pos = ta?.selectionStart ?? content.length;
      const newContent = content.slice(0, pos) + text + ' ' + content.slice(pos);
      setContent(newContent);
    },
    [content, setContent]
  );

  // Image handlers
  const insertImageMarkdown = useCallback(
    (dataUrl: string, filename: string) => {
      const ta = textareaRef.current;
      const pos = ta?.selectionStart ?? content.length;
      const md = `![${filename}](${dataUrl})`;
      const newContent = content.slice(0, pos) + '\n' + md + '\n' + content.slice(pos);
      setContent(newContent);
      requestAnimationFrame(() => {
        if (ta) {
          const newPos = pos + md.length + 2;
          ta.focus();
          ta.setSelectionRange(newPos, newPos);
        }
      });
    },
    [content, setContent]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          setImageUploading(true);
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = () => {
            insertImageMarkdown(reader.result as string, file.name || 'image');
            setImageUploading(false);
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    },
    [insertImageMarkdown]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          setImageUploading(true);
          const reader = new FileReader();
          reader.onload = () => {
            insertImageMarkdown(reader.result as string, file.name);
            setImageUploading(false);
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    },
    [insertImageMarkdown]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer?.types.includes('Files')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  // Auto-hide AI toolbar on Escape
  useEffect(() => {
    if (!showAiToolbar) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAiToolbar(false);
        setAiSelection(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showAiToolbar]);

  // ── Wikilink autocomplete ──
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    const pos = e.target.selectionStart;
    const before = val.slice(0, pos);
    const match = before.match(/\[\[([^\]\n]*)$/);
    if (match) {
      setShowSuggestions(true);
      setCursorIdx(pos);
      fetch('/api/notes')
        .then((r) => r.json())
        .then((notes: { slug: string; title: string }[]) => {
          const filtered = notes.filter(
            (n) =>
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

  useEffect(() => {
    setHighlightedIndex(0);
  }, [suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSuggestionClick(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
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

  const statusDot =
    contentStatus === 'saving'
      ? 'bg-yellow-400'
      : contentStatus === 'saved'
        ? 'bg-green-400'
        : contentStatus === 'error'
          ? 'bg-red-400'
          : 'bg-transparent';

  const statusText =
    contentStatus === 'saving'
      ? t('saving')
      : contentStatus === 'saved' && lastSavedAt
        ? `${t('saved')} ${lastSavedAt.toLocaleTimeString()}`
        : contentStatus === 'error'
          ? '⚠ Saved locally'
          : restoredFromBackup
            ? '📋 Restored draft'
            : '';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-1 pb-3 border-b border-[var(--color-border)] mb-3">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitleState(e.target.value);
            debounceTitle(e.target.value, tags);
          }}
          onBlur={() => {
            if (titleTimerRef.current) {
              clearTimeout(titleTimerRef.current);
              titleTimerRef.current = null;
            }
            saveTitleAndTags(titleLatestRef.current.title, titleLatestRef.current.tags);
          }}
          className="flex-1 text-xl font-bold bg-transparent border-none outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
          placeholder={t('note_title_placeholder')}
        />
        <div className="flex items-center gap-2 shrink-0">
          <span className={`w-2 h-2 rounded-full ${statusDot}`} />
          <span className="text-xs text-[var(--color-text-muted)]">{statusText}</span>
        </div>
      </div>
      <input
        type="text"
        value={tags}
        onChange={(e) => {
          setTags(e.target.value);
          debounceTitle(title, e.target.value);
        }}
        onBlur={() => {
          if (titleTimerRef.current) {
            clearTimeout(titleTimerRef.current);
            titleTimerRef.current = null;
          }
          saveTitleAndTags(titleLatestRef.current.title, titleLatestRef.current.tags);
        }}
        className="text-xs mb-3 px-1 py-1 bg-transparent border-b border-[var(--color-border)] outline-none text-[var(--color-text-secondary)] placeholder-[var(--color-text-muted)]"
        placeholder={t('tags_placeholder')}
      />
      <div className="flex-1 relative">
        <div className="absolute top-0 right-0 z-10">
          <VoiceInput onTranscript={handleVoiceTranscript} />
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onBlur={() => {
            saveNow();
            setTimeout(() => setShowAiToolbar(false), 200);
          }}
          placeholder={t('start_writing')}
          className="w-full h-full min-h-[400px] bg-transparent border-none outline-none resize-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] leading-relaxed"
        />
        {(aiLoading || imageUploading) && (
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--color-text-secondary)] shadow-lg z-20">
            <div className="animate-spin w-3 h-3 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
            {aiLoading ? 'AI generating...' : 'Uploading image...'}
          </div>
        )}
        {showAiToolbar && aiSelection && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-2 py-1.5 shadow-xl z-20">
            {(['polish', 'summarize', 'expand', 'translate'] as const).map((action) => (
              <button
                key={action}
                onClick={() => handleAiAction(action)}
                className="px-2.5 py-1 text-xs rounded-lg transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-subtle)]"
                title={action}
              >
                {action === 'polish' && <><Sparkles size={12} className="inline mr-0.5" />{locale === 'zh' ? '润色' : 'Polish'}</>}
                {action === 'summarize' && <><FileText size={12} className="inline mr-0.5" />{locale === 'zh' ? '总结' : 'Summarize'}</>}
                {action === 'expand' && <><MoveRight size={12} className="inline mr-0.5" />{locale === 'zh' ? '扩展' : 'Expand'}</>}
                {action === 'translate' && <><Languages size={12} className="inline mr-0.5" />{locale === 'zh' ? '翻译' : 'Translate'}</>}
              </button>
            ))}
          </div>
        )}
        {showSuggestions && (
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-2 max-h-32 overflow-y-auto shadow-xl z-10">
            {suggestions.length > 0 ? (
              suggestions.map((s, idx) => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${
                    idx === highlightedIndex
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'hover:bg-[var(--color-accent-subtle)]'
                  }`}
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
