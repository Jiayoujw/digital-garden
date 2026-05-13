'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAutoSave } from '@/lib/useAutoSave';

export default function DailyDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const { t, locale } = useLanguage();
  const dateLocale = locale === 'zh' ? zhCN : enUS;
  const [initialContent, setInitialContent] = useState('');

  useEffect(() => {
    fetch(`/api/daily/${date}`)
      .then((r) => r.json())
      .then((d) => setInitialContent(d.content ?? ''))
      .catch(() => setInitialContent(''));
  }, [date]);

  const saveToServer = useCallback(
    async (contentVal: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/daily/${date}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: contentVal }),
          keepalive: true,
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    [date]
  );

  const {
    content,
    status,
    lastSavedAt,
    setContent,
    saveNow,
    restoredFromBackup,
  } = useAutoSave({
    storageKey: `garden-daily-${date}`,
    initialContent,
    saveToServer,
  });

  const statusDot =
    status === 'saving'
      ? 'bg-yellow-400'
      : status === 'saved'
        ? 'bg-green-400'
        : status === 'error'
          ? 'bg-red-400'
          : 'bg-transparent';

  const statusLabel =
    status === 'saving'
      ? t('saving')
      : status === 'saved' && lastSavedAt
        ? `${t('saved')} ${lastSavedAt.toLocaleTimeString()}`
        : status === 'error'
          ? '⚠ Saved locally'
          : restoredFromBackup
            ? '📋 Restored draft'
            : t('auto_saves');

  return (
    <div className="max-w-4xl mx-auto px-8 py-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6">
        {format(new Date(date + 'T00:00:00'), 'PPPP', { locale: dateLocale })}
      </h1>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={saveNow}
        placeholder={t('whats_on_mind')}
        className="flex-1 w-full min-h-[300px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-5 resize-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors leading-relaxed"
      />
      <div className="flex items-center gap-2 mt-3">
        <span className={`w-2 h-2 rounded-full ${statusDot}`} />
        <span className="text-xs text-[var(--color-text-muted)]">{statusLabel}</span>
      </div>
    </div>
  );
}
