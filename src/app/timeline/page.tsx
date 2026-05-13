'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TagList } from '@/components/note/TagList';

interface TimelineEntry {
  slug: string;
  title: string;
  tags: string[];
  created: string;
  updated: string;
  type: 'note' | 'daily';
}

function groupByMonth(entries: TimelineEntry[]) {
  const groups: { month: string; entries: TimelineEntry[] }[] = [];
  for (const entry of entries) {
    const month = entry.created.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.month === month) {
      last.entries.push(entry);
    } else {
      groups.push({ month, entries: [entry] });
    }
  }
  return groups;
}

export default function TimelinePage() {
  const { locale } = useLanguage();
  const dateLocale = locale === 'zh' ? zhCN : enUS;
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/notes').then((r) => r.json()),
      fetch('/api/daily').then((r) => r.json()),
    ])
      .then(([notes, daily]) => {
        const noteEntries: TimelineEntry[] = (Array.isArray(notes) ? notes : []).map(
          (n: { slug: string; title: string; tags: string[]; updated: string }) => ({
            slug: n.slug,
            title: n.title,
            tags: n.tags ?? [],
            created: n.updated,
            updated: n.updated,
            type: 'note' as const,
          })
        );
        const dailyEntries: TimelineEntry[] = (Array.isArray(daily) ? daily : []).map(
          (d: { date: string; title: string }) => ({
            slug: d.date,
            title: d.title || d.date,
            tags: [],
            created: d.date,
            updated: d.date,
            type: 'daily' as const,
          })
        );

        const all = [...noteEntries, ...dailyEntries].sort(
          (a, b) => b.created.localeCompare(a.created)
        );
        setEntries(all);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const groups = groupByMonth(entries);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-6">
      <h1 className="text-2xl font-bold mb-8">
        {locale === 'zh' ? '时间线' : 'Timeline'}
      </h1>

      {groups.length === 0 ? (
        <p className="text-[var(--color-text-muted)] text-center py-12">
          {locale === 'zh' ? '暂无笔记' : 'No notes yet'}
        </p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-0 w-[2px] bg-[var(--color-border)]" />

          {groups.map((group) => (
            <div key={group.month} className="mb-8">
              {/* Month header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-[16px] h-[16px] rounded-full bg-[var(--color-accent)] ring-4 ring-[var(--color-accent-subtle)] shrink-0 z-10" />
                <h2 className="text-sm font-semibold text-[var(--color-accent-hover)] uppercase tracking-wider">
                  {format(parseISO(group.month + '-01'), 'MMMM yyyy', {
                    locale: dateLocale,
                  })}
                </h2>
              </div>

              {/* Entries */}
              <div className="ml-5 pl-6 border-l-2 border-[var(--color-border)] space-y-3">
                {group.entries.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={
                      entry.type === 'daily'
                        ? `/daily/${entry.slug}`
                        : `/note/${entry.slug}`
                    }
                    className="block group"
                  >
                    <div className="relative -ml-[35px] pl-[35px]">
                      {/* Dot on timeline */}
                      <div
                        className={`absolute left-0 top-[10px] w-[10px] h-[10px] rounded-full border-2 transition-colors ${
                          entry.type === 'daily'
                            ? 'border-[var(--color-success)] bg-[var(--color-success)] bg-opacity-30'
                            : 'border-[var(--color-accent)] bg-[var(--color-accent)] bg-opacity-30'
                        } group-hover:scale-150`}
                      />
                      {/* Card */}
                      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-accent)] transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-hover)] transition-colors truncate">
                              {entry.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs text-[var(--color-text-muted)]">
                                {format(parseISO(entry.created), 'MMM d, yyyy', {
                                  locale: dateLocale,
                                })}
                              </span>
                              {entry.type === 'daily' && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-success)] bg-opacity-15 text-[var(--color-success)]">
                                  Daily
                                </span>
                              )}
                            </div>
                          </div>
                          {entry.tags.length > 0 && (
                            <div className="hidden sm:block shrink-0">
                              <TagList tags={entry.tags} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
