'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Heatmap } from '@/components/daily/Heatmap';
import { VoiceInput } from '@/components/shared/VoiceInput';
import { useAutoSave } from '@/lib/useAutoSave';

export default function DailyPage() {
  const { t, locale } = useLanguage();
  const dateLocale = locale === 'zh' ? zhCN : enUS;
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [initialContent, setInitialContent] = useState('');
  const [dailyNotes, setDailyNotes] = useState<{ date: string; title: string }[]>([]);

  // Load content when date changes
  useEffect(() => {
    fetch(`/api/daily/${selectedDate}`)
      .then((r) => r.json())
      .then((d) => setInitialContent(d.content ?? ''))
      .catch(() => setInitialContent(''));
  }, [selectedDate]);

  useEffect(() => {
    fetch('/api/daily')
      .then((r) => r.json())
      .then(setDailyNotes)
      .catch(() => {});
  }, [selectedDate]);

  const dailyNotesSet = useMemo(
    () => new Set(dailyNotes.map((n) => n.date)),
    [dailyNotes]
  );

  const saveToServer = useCallback(
    async (contentVal: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/daily/${selectedDate}`, {
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
    [selectedDate]
  );

  const {
    content,
    status,
    lastSavedAt,
    setContent,
    saveNow,
    restoredFromBackup,
  } = useAutoSave({
    storageKey: `garden-daily-${selectedDate}`,
    initialContent,
    saveToServer,
  });

  const navigateDate = (days: number) => {
    // Save current content before navigating
    saveNow();
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(format(d, 'yyyy-MM-dd'));
  };

  const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return format(d, 'yyyy-MM-dd');
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
      <h1 className="text-2xl font-bold mb-6">{t('daily_notes')}</h1>

      {/* Heatmap */}
      <div className="mb-6 bg-[var(--color-bg-secondary)] rounded-xl p-4 border border-[var(--color-border)]">
        <Heatmap
          dailyNotes={dailyNotesSet}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          locale={locale}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateDate(-1)}
          className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          {t('prev')}
        </button>
        <button
          onClick={() => {
            saveNow();
            setSelectedDate(today);
          }}
          className="px-4 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          {t('today')}
        </button>
        <button
          onClick={() => navigateDate(1)}
          className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          {t('next')}
        </button>
      </div>

      <div className="flex gap-1 mb-6">
        {weekDays.map((d) => (
          <button
            key={d}
            onClick={() => {
              saveNow();
              setSelectedDate(d);
            }}
            className={`flex-1 py-2 rounded-lg text-center text-xs transition-colors ${
              d === selectedDate
                ? 'bg-[var(--color-accent)] text-white'
                : isToday(new Date(d))
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-hover)]'
                  : dailyNotesSet.has(d)
                    ? 'bg-[var(--color-bg-secondary)] border border-[var(--color-text-muted)] text-[var(--color-text-secondary)]'
                    : 'bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            {format(new Date(d), 'd')}
            <div className="text-[10px] opacity-60">
              {format(new Date(d), 'EEE', { locale: dateLocale })}
            </div>
          </button>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">
        {format(new Date(selectedDate), 'PPP', { locale: dateLocale })}
      </h2>

      <div className="relative flex-1">
        <div className="absolute top-3 right-3 z-10">
          <VoiceInput onTranscript={(text) => setContent(content + text + ' ')} />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={saveNow}
          placeholder={t('whats_on_mind')}
          className="w-full h-full min-h-[300px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-5 resize-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors leading-relaxed"
        />
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusDot}`} />
          <span className="text-xs text-[var(--color-text-muted)]">{statusLabel}</span>
        </div>
        <Link
          href="/daily"
          className="text-xs text-[var(--color-accent-hover)] hover:underline"
        >
          {t('all_daily_notes')}
        </Link>
      </div>
    </div>
  );
}
