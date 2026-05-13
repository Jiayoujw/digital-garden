'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Heatmap } from '@/components/daily/Heatmap';
import { VoiceInput } from '@/components/shared/VoiceInput';

export default function DailyPage() {
  const { t, locale } = useLanguage();
  const dateLocale = locale === 'zh' ? zhCN : enUS;
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [dailyNotes, setDailyNotes] = useState<{ date: string; title: string }[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef({ date: today, content: '' });
  const currentDateRef = useRef(selectedDate);

  // Keep currentDateRef in sync
  currentDateRef.current = selectedDate;

  // Load content when date changes
  useEffect(() => {
    setSaving(false);
    fetch(`/api/daily/${selectedDate}`)
      .then((r) => r.json())
      .then((d) => {
        const c = d.content ?? '';
        setContent(c);
        latestRef.current = { date: selectedDate, content: c };
      })
      .catch(() => {
        setContent('');
        latestRef.current = { date: selectedDate, content: '' };
      });
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

  const doSave = useCallback(async (date: string, contentVal: string) => {
    try {
      await fetch(`/api/daily/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentVal }),
        keepalive: true,
      });
    } catch {
      // silently fail
    }
  }, []);

  const save = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSaving(true);
    const { date, content: c } = latestRef.current;
    doSave(date, c).finally(() => setSaving(false));
  }, [doSave]);

  // Debounced auto-save
  const debounceSave = useCallback(
    (date: string, contentVal: string) => {
      latestRef.current = { date, content: contentVal };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setSaving(true);
        doSave(date, contentVal).finally(() => setSaving(false));
      }, 800);
    },
    [doSave]
  );

  // Flush pending save on unmount (navigation away)
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const { date, content: c } = latestRef.current;
      fetch(`/api/daily/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: c }),
        keepalive: true,
      }).catch(() => {});
    };
  }, []);

  // beforeunload safety net (tab close, browser close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const { date, content: c } = latestRef.current;
      fetch(`/api/daily/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: c }),
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const navigateDate = (days: number) => {
    // Save current content before navigating
    save();
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(format(d, 'yyyy-MM-dd'));
  };

  const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return format(d, 'yyyy-MM-dd');
  });

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
          onClick={() => setSelectedDate(today)}
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
            onClick={() => setSelectedDate(d)}
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
          <VoiceInput
            onTranscript={(text) => {
              const newContent = latestRef.current.content + text + ' ';
              setContent(newContent);
              debounceSave(currentDateRef.current, newContent);
            }}
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => {
            const val = e.target.value;
            setContent(val);
            debounceSave(currentDateRef.current, val);
          }}
          onBlur={save}
          placeholder={t('whats_on_mind')}
          className="w-full h-full min-h-[300px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-5 resize-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors leading-relaxed"
        />
      </div>

      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-[var(--color-text-muted)]">
          {saving ? t('saving') : t('auto_saves')}
        </span>
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
