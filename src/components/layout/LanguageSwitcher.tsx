'use client';

import { Languages } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--color-bg-tertiary)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <Languages size={14} />
    </button>
  );
}
