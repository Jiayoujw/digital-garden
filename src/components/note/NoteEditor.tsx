'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { VoiceInput } from '@/components/shared/VoiceInput';
import { Sparkles, FileText, MoveRight, Languages } from 'lucide-react';

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
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState(initialTags.join(', '));
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [cursorIdx, setCursorIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Track latest values for unmount save
  const latestRef = useRef({ title: initialTitle, content: initialContent, tags: initialTags.join(', ') });

  // AI assistant state
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiToolbar, setShowAiToolbar] = useState(false);
  const [aiSelection, setAiSelection] = useState<{ text: string; start: number; end: number } | null>(null);

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
          keepalive: true,
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
    latestRef.current = { title: initialTitle, content: initialContent, tags: initialTags.join(', ') };
  }, [initialContent, initialTitle, initialTags, slug]);

  // Flush pending save on unmount (user navigated away)
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const { title: t, content: c, tags: tg } = latestRef.current;
      fetch(`/api/notes/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: t,
          content: c,
          tags: tg
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
        keepalive: true,
      }).catch(() => {});
    };
  }, [slug]);

  const debounceSave = (titleVal: string, contentVal: string, tagsVal: string) => {
    latestRef.current = { title: titleVal, content: contentVal, tags: tagsVal };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(titleVal, contentVal, tagsVal), 800);
  };

  const handleBlur = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const { title: t, content: c, tags: tg } = latestRef.current;
    save(t, c, tg);
  };

  // AI assistant
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
          // Replace selection with AI result
          const newContent =
            content.slice(0, aiSelection.start) +
            '\n\n' +
            data.text.trim() +
            '\n\n' +
            content.slice(aiSelection.end);
          setContent(newContent);
          debounceSave(title, newContent, tags);
          // Restore focus and cursor position after replaced text
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
    [aiSelection, content, title, tags, debounceSave, locale]
  );

  // Voice input handler — insert transcribed text at cursor or end
  const handleVoiceTranscript = useCallback(
    (text: string) => {
      const ta = textareaRef.current;
      const pos = ta?.selectionStart ?? content.length;
      const newContent = content.slice(0, pos) + text + ' ' + content.slice(pos);
      setContent(newContent);
      debounceSave(title, newContent, tags);
    },
    [content, title, tags, debounceSave]
  );

  // Image upload state
  const [imageUploading, setImageUploading] = useState(false);

  // Insert base64 image at cursor
  const insertImageMarkdown = useCallback(
    (dataUrl: string, filename: string) => {
      const ta = textareaRef.current;
      const pos = ta?.selectionStart ?? content.length;
      const md = `![${filename}](${dataUrl})`;
      const newContent = content.slice(0, pos) + '\n' + md + '\n' + content.slice(pos);
      setContent(newContent);
      debounceSave(title, newContent, tags);
      // Place cursor after inserted image
      requestAnimationFrame(() => {
        if (ta) {
          const newPos = pos + md.length + 2;
          ta.focus();
          ta.setSelectionRange(newPos, newPos);
        }
      });
    },
    [content, title, tags, debounceSave]
  );

  // Handle image paste (Ctrl+V)
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

  // Handle image drag & drop
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
          onBlur={handleBlur}
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
        onBlur={handleBlur}
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
            // Delay blur to let select/click events fire first
            setTimeout(() => {
              handleBlur();
              setShowAiToolbar(false);
            }, 200);
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
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-2 max-h-32 overflow-y-auto shadow-xl">
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
