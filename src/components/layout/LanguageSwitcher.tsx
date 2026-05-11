'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
      title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      {locale === 'zh' ? '中 → EN' : 'EN → 中'}
    </button>
  );
}
