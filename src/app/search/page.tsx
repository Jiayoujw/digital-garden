'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
  slug: string;
  title: string;
  tags: string[];
  updated: string;
  score: number;
  snippet: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-3xl mx-auto px-8 py-6">
      <h1 className="text-2xl font-bold mb-2">
        {q ? `Search: "${q}"` : 'Search'}
      </h1>
      {q && (
        <p className="text-[var(--color-text-secondary)] text-sm mb-8">
          {loading
            ? 'Searching...'
            : `${results.length} result${results.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {!q.trim() && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-4xl">🔍</span>
          <p className="text-[var(--color-text-muted)] text-lg">
            Search your notes
          </p>
          <p className="text-[var(--color-text-muted)] text-sm">
            Use the search bar to find notes by title, content, or tags
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && q && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-4xl">🌱</span>
          <p className="text-[var(--color-text-muted)] text-lg">
            No notes found
          </p>
          <p className="text-[var(--color-text-muted)] text-sm">
            Try different keywords
          </p>
        </div>
      )}

      <div className="space-y-3">
        {results.map((result) => (
          <Link
            key={result.slug}
            href={`/note/${result.slug}`}
            className="block p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium">{result.title}</h3>
              {result.score !== undefined && (
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {Math.round(result.score * 100)}% match
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-2">
              {result.snippet || 'No content'}
            </p>
            {result.tags.length > 0 && (
              <div className="flex gap-1.5">
                {result.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
