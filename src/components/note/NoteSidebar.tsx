'use client';

import { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface NoteSidebarProps {
  content: string;
}

function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(content)) !== null) {
    items.push({
      id: match[2].toLowerCase().replace(/[^\w一-鿿]+/g, '-').replace(/^-|-$/g, ''),
      text: match[2],
      level: match[1].length,
    });
  }
  return items;
}

function countStats(content: string) {
  // Count words (Chinese chars count individually, Latin words by space)
  const chineseChars = (content.match(/[一-鿿]/g) || []).length;
  const latinWords = content
    .replace(/[一-鿿]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const wordCount = chineseChars + latinWords;

  // Count links (wikilinks and markdown links)
  const wikilinks = (content.match(/\[\[.+?\]\]/g) || []).length;
  const mdLinks = (content.match(/\[.+?\]\(.+?\)/g) || []).length;

  // Reading time: avg 200 wpm for mixed content, 400 cpm for Chinese
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 300));

  return { wordCount, wikilinks, mdLinks, readingTimeMin };
}

export function NoteSidebar({ content }: NoteSidebarProps) {
  const { locale } = useLanguage();
  const toc = useMemo(() => extractToc(content), [content]);
  const stats = useMemo(() => countStats(content), [content]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  // Track scroll to highlight current heading
  useEffect(() => {
    if (toc.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc, content]);

  if (toc.length === 0) return null;

  return (
    <aside className="w-56 shrink-0">
      <div className="sticky top-6 space-y-4">
        {/* Stats card */}
        {!collapsed && (
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-lg font-semibold text-[var(--color-accent-hover)]">
                  {stats.wordCount.toLocaleString()}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)]">
                  {locale === 'zh' ? '字数' : 'Words'}
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold text-[var(--color-accent-hover)]">
                  {stats.readingTimeMin}m
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)]">
                  {locale === 'zh' ? '阅读' : 'Read'}
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold text-[var(--color-text-muted)]">
                  {stats.wikilinks}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)]">
                  {locale === 'zh' ? '内链' : 'Links'}
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold text-[var(--color-text-muted)]">
                  {stats.mdLinks}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)]">
                  {locale === 'zh' ? '外链' : 'Refs'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOC */}
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hover:text-[var(--color-text-primary)] transition-colors"
          >
            {locale === 'zh' ? '目录' : 'Contents'}
            <span className="text-[10px]">{collapsed ? '▶' : '▼'}</span>
          </button>
          {!collapsed && (
            <nav className="px-2 pb-2 max-h-[50vh] overflow-y-auto">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`block text-xs py-1 px-2 rounded transition-colors ${
                    activeId === item.id
                      ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-hover)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                  style={{ paddingLeft: `${item.level * 8}px` }}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </aside>
  );
}
