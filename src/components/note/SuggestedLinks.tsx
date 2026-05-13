'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Suggestion {
  slug: string;
  title: string;
}

interface SuggestedLinksProps {
  slug: string;
}

export function SuggestedLinks({ slug }: SuggestedLinksProps) {
  const { locale } = useLanguage();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = useCallback(() => {
    setLoading(true);
    fetch(`/api/notes/${slug}/suggest-links`)
      .then((r) => r.json())
      .then((data) => {
        if (data.suggestions?.length) {
          setSuggestions(data.suggestions);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    // Delay fetching to avoid blocking page load
    const timer = setTimeout(fetchSuggestions, 1500);
    return () => clearTimeout(timer);
  }, [fetchSuggestions]);

  if (loading) {
    return (
      <div className="mt-6 border-t border-[var(--color-border)] pt-4">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <div className="animate-spin w-3 h-3 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
          {locale === 'zh' ? 'AI 分析中...' : 'AI analyzing connections...'}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-6 border-t border-[var(--color-border)] pt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
          {locale === 'zh' ? '🔗 AI 建议关联' : '🔗 AI Suggested Links'}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <Link
            key={s.slug}
            href={`/note/${s.slug}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[var(--color-accent-subtle)] text-[var(--color-accent-hover)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
          >
            {s.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
