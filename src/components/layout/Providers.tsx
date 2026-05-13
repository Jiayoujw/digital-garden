'use client';

import { useEffect, type ReactNode } from 'react';
import { LanguageProvider, useLanguage } from '@/lib/i18n/LanguageContext';
import { ThemeProvider } from '@/lib/theme/ThemeContext';

function LangUpdater() {
  const { locale, t } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t('html_title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('html_description'));
  }, [locale, t]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <LangUpdater />
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
