'use client';

import { useMemo } from 'react';
import { format, eachDayOfInterval, subDays, getDay, isToday } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';

interface HeatmapProps {
  dailyNotes: Set<string>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  locale: 'en' | 'zh';
  monthsToShow?: number;
}

const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export function Heatmap({
  dailyNotes,
  selectedDate,
  onSelectDate,
  locale,
  monthsToShow = 12,
}: HeatmapProps) {
  const dateLocale = locale === 'zh' ? zhCN : enUS;
  const today = format(new Date(), 'yyyy-MM-dd');
  const endDate = new Date();
  const startDate = subDays(endDate, monthsToShow * 30);

  const { weeks, monthLabels } = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks: string[][] = [];
    // Pad start to align with Monday
    let currentWeek: string[] = [];
    const firstDayOfWeek = getDay(startDate) === 0 ? 6 : getDay(startDate) - 1;
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push('');
    }

    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = '';

    days.forEach((day, idx) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const monthStr = format(day, 'MMM', { locale: dateLocale });

      if (monthStr !== lastMonth) {
        labels.push({ label: monthStr, weekIndex: weeks.length });
        lastMonth = monthStr;
      }

      currentWeek.push(dateStr);
      if (currentWeek.length === 7 || idx === days.length - 1) {
        while (currentWeek.length < 7) currentWeek.push('');
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push('');
      weeks.push([...currentWeek]);
    }

    return { weeks, monthLabels: labels };
  }, [startDate, endDate, dateLocale]);

  return (
    <div className="overflow-x-auto pb-2">
      {/* Month labels */}
      <div className="flex gap-0 ml-8 mb-1">
        {monthLabels.map((m, i) => {
          const prevWeekIdx = i > 0 ? monthLabels[i - 1].weekIndex : 0;
          const offset = (m.weekIndex - prevWeekIdx) * 13;
          return (
            <span
              key={m.label}
              className="text-[10px] text-[var(--color-text-muted)] shrink-0"
              style={{ marginLeft: i === 0 ? 0 : offset - 13 * (i > 0 ? 1 : 0) }}
            >
              {m.label}
            </span>
          );
        })}
      </div>

      <div className="flex gap-0">
        {/* Weekday labels */}
        <div className="flex flex-col gap-[3px] mr-2 pt-0">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="text-[9px] text-[var(--color-text-muted)] h-[11px] leading-[11px] w-6 text-right">
              {d}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((dateStr, di) => {
                if (!dateStr) {
                  return <div key={`empty-${di}`} className="w-[11px] h-[11px]" />;
                }
                const hasNote = dailyNotes.has(dateStr);
                const isSelected = dateStr === selectedDate;
                const isTodayDate = dateStr === today;

                let bg = 'bg-[var(--color-bg-tertiary)]';
                if (isSelected) bg = 'bg-[var(--color-accent)]';
                else if (hasNote) bg = 'bg-[var(--color-accent)] opacity-80';
                else bg = 'bg-[var(--color-border)] opacity-40';

                return (
                  <button
                    key={dateStr}
                    title={`${dateStr}${hasNote ? ' — ' + (locale === 'zh' ? '有笔记' : 'Has note') : ''}`}
                    onClick={() => onSelectDate(dateStr)}
                    className={`w-[11px] h-[11px] rounded-sm transition-all hover:scale-150 hover:z-10 ${bg} ${
                      isTodayDate ? 'ring-1 ring-[var(--color-accent)]' : ''
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 ml-8 text-[10px] text-[var(--color-text-muted)]">
        <span>{locale === 'zh' ? '少' : 'Less'}</span>
        <div className="w-[11px] h-[11px] rounded-sm bg-[var(--color-border)] opacity-40" />
        <div className="w-[11px] h-[11px] rounded-sm bg-[var(--color-accent)] opacity-80" />
        <span>{locale === 'zh' ? '多' : 'More'}</span>
      </div>
    </div>
  );
}
