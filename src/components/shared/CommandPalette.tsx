'use client';

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useTheme, themes, type ThemeId } from '@/lib/theme/ThemeContext';
import {
  LayoutDashboard, GitGraph, Calendar, Hexagon, Clock, Hash,
  FileText, Search, Command
} from 'lucide-react';
import type { NoteSummary } from '@/lib/types';

interface Command {
  id: string;
  label: string;
  labelZh: string;
  icon: ReactNode;
  action: () => void;
  section: 'pages' | 'actions' | 'theme';
}

const navIcons: Record<string, ReactNode> = {
  home: <LayoutDashboard size={16} />,
  graph: <GitGraph size={16} />,
  daily: <Calendar size={16} />,
  clusters: <Hexagon size={16} />,
  timeline: <Clock size={16} />,
  tags: <Hash size={16} />,
};

export function CommandPalette() {
  const { t, locale } = useLanguage();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch notes for search
  useEffect(() => {
    fetch('/api/notes')
      .then((r) => r.json())
      .then(setNotes)
      .catch(() => {});
  }, [open]);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const pages: Command[] = [
    { id: 'home', label: 'Home', labelZh: '首页', icon: navIcons.home, action: () => router.push('/'), section: 'pages' },
    { id: 'graph', label: 'Graph', labelZh: '图谱', icon: navIcons.graph, action: () => router.push('/graph'), section: 'pages' },
    { id: 'daily', label: 'Daily', labelZh: '日记', icon: navIcons.daily, action: () => router.push('/daily'), section: 'pages' },
    { id: 'clusters', label: 'Clusters', labelZh: '聚类', icon: navIcons.clusters, action: () => router.push('/clusters'), section: 'pages' },
    { id: 'timeline', label: 'Timeline', labelZh: '时间线', icon: navIcons.timeline, action: () => router.push('/timeline'), section: 'pages' },
    { id: 'tags', label: 'Tags', labelZh: '标签', icon: navIcons.tags, action: () => router.push('/tags'), section: 'pages' },
  ];

  const themeCommands: Command[] = (Object.keys(themes) as ThemeId[]).map((tid) => ({
    id: `theme-${tid}`,
    label: themes[tid].name,
    labelZh: themes[tid].nameZh,
    icon: themes[tid].icon,
    action: () => setTheme(tid),
    section: 'theme' as const,
  }));

  const noteCommands: Command[] = query.trim()
    ? notes
        .filter(
          (n) =>
            n.title.toLowerCase().includes(query.toLowerCase()) ||
            n.slug.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
        .map((n) => ({
          id: `note-${n.slug}`,
          label: n.title,
          labelZh: n.title,
          icon: <FileText size={16} />,
          action: () => router.push(`/note/${n.slug}`),
          section: 'pages' as const,
        }))
    : notes.slice(0, 5).map((n) => ({
        id: `note-${n.slug}`,
        label: n.title,
        labelZh: n.title,
        icon: <FileText size={16} />,
        action: () => router.push(`/note/${n.slug}`),
        section: 'pages' as const,
      }));

  const allCommands = [...pages, ...themeCommands, ...noteCommands];
  const filteredCommands = query.trim()
    ? allCommands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.labelZh.toLowerCase().includes(query.toLowerCase()) ||
          c.id.toLowerCase().includes(query.toLowerCase())
      )
    : [...pages, ...themeCommands, ...noteCommands];

  const sections = new Map<string, Command[]>();
  for (const cmd of filteredCommands) {
    const existing = sections.get(cmd.section) ?? [];
    existing.push(cmd);
    sections.set(cmd.section, existing);
  }

  const flatCommands = Array.from(sections.values()).flat();
  // Clamp index
  const safeIndex = Math.min(selectedIndex, Math.max(0, flatCommands.length - 1));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatCommands[safeIndex]) {
        flatCommands[safeIndex].action();
        setOpen(false);
      }
    }
  };

  const sectionLabels: Record<string, string> = {
    pages: locale === 'zh' ? '页面 & 笔记' : 'Pages & Notes',
    actions: locale === 'zh' ? '操作' : 'Actions',
    theme: locale === 'zh' ? '主题' : 'Themes',
  };

  if (!open) return null;

  let cmdIndex = -1;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/60" onClick={() => setOpen(false)}>
      <div
        className="w-[560px] max-h-[480px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
          <Command size={16} className="text-[var(--color-text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={locale === 'zh' ? '搜索笔记、页面或切换主题...' : 'Search notes, pages, or change theme...'}
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
          />
          <kbd className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 p-2">
          {Array.from(sections.entries()).map(([section, cmds]) => (
            <div key={section} className="mb-2">
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-3 py-1">
                {sectionLabels[section] ?? section}
              </p>
              {cmds.map((cmd) => {
                cmdIndex++;
                const isSelected = cmdIndex === safeIndex;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      setOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(cmdIndex)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-hover)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                    }`}
                  >
                    <span className="w-5 flex items-center justify-center">{cmd.icon}</span>
                    <span>{locale === 'zh' ? cmd.labelZh : cmd.label}</span>
                    {section === 'theme' && cmd.id === `theme-${theme}` && (
                      <span className="ml-auto text-[10px] text-[var(--color-accent)]">
                        {locale === 'zh' ? '当前' : 'active'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {flatCommands.length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
              {locale === 'zh' ? '无匹配结果' : 'No results found'}
            </p>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)]">
          <span>↑↓ {locale === 'zh' ? '导航' : 'navigate'}</span>
          <span>↵ {locale === 'zh' ? '选择' : 'select'}</span>
          <span>Esc {locale === 'zh' ? '关闭' : 'close'}</span>
        </div>
      </div>
    </div>
  );
}
