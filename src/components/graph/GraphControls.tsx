'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

interface GraphControlsProps {
  mode: '2d' | '3d';
  onModeChange: (mode: '2d' | '3d') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  focusSlug: string | null;
  onClearFocus: () => void;
}

export function GraphControls({
  mode,
  onModeChange,
  searchQuery,
  onSearchChange,
  focusSlug,
  onClearFocus,
}: GraphControlsProps) {
  const { t } = useLanguage();

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2 flex-wrap">
      {/* Search input */}
      <div className="relative flex-1 max-w-xs">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('graph_search_placeholder')}
          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Focus indicator + clear button */}
      {focusSlug && (
        <button
          onClick={onClearFocus}
          className="px-3 py-1.5 rounded-lg text-xs bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t('show_all')}
        </button>
      )}

      {/* 2D/3D toggle — pushed to the right */}
      <div className="ml-auto flex gap-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-1">
        <button
          onClick={() => onModeChange('2d')}
          className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
            mode === '2d'
              ? 'bg-[var(--color-accent)] text-white'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          2D
        </button>
        <button
          onClick={() => onModeChange('3d')}
          className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
            mode === '3d'
              ? 'bg-[var(--color-accent)] text-white'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          3D
        </button>
      </div>
    </div>
  );
}
