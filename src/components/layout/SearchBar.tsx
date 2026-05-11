'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function SearchBar({ large = false }: { large?: boolean }) {
  const { t } = useLanguage();
  const [term, setTerm] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      router.push(`/search?q=${encodeURIComponent(term.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={t('search_your_garden')}
        className={`w-full rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors ${
          large ? 'px-5 py-3 text-lg' : 'px-4 py-2 text-sm'
        }`}
      />
    </form>
  );
}
