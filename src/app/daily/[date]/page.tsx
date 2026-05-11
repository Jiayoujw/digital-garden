'use client';

import { useState, useEffect, use } from 'react';
import { format } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function DailyDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const { t, locale } = useLanguage();
  const dateLocale = locale === 'zh' ? zhCN : enUS;
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/daily/${date}`)
      .then((r) => r.json())
      .then((d) => setContent(d.content ?? ''))
      .catch(() => setContent(''));
  }, [date]);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/daily/${date}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6">
        {format(new Date(date + 'T00:00:00'), 'PPPP', { locale: dateLocale })}
      </h1>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={save}
        placeholder={t('whats_on_mind')}
        className="flex-1 w-full min-h-[300px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-5 resize-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors leading-relaxed"
      />
      <p className="text-xs text-[var(--color-text-muted)] mt-3">
        {saving ? t('saving') : t('auto_saves')}
      </p>
    </div>
  );
}
