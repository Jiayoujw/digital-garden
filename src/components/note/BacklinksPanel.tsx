'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface LinkWithContext {
  slug: string;
  title: string;
  tags?: string[];
  updated?: string;
  context?: string | null;
}

interface BacklinksPanelProps {
  slug: string;
}

export function BacklinksPanel({ slug }: BacklinksPanelProps) {
  const { t } = useLanguage();
  const [backlinks, setBacklinks] = useState<LinkWithContext[]>([]);
  const [forwardLinks, setForwardLinks] = useState<LinkWithContext[]>([]);

  useEffect(() => {
    fetch(`/api/notes/${slug}/links`)
      .then((r) => r.json())
      .then((data) => {
        setBacklinks(data.back ?? []);
        setForwardLinks(data.forward ?? []);
      })
      .catch(() => {});
  }, [slug]);

  if (backlinks.length === 0 && forwardLinks.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-[var(--color-border)] space-y-6">
      {forwardLinks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            {t('links_to')} ({forwardLinks.length})
          </h3>
          <div className="space-y-2">
            {forwardLinks.map((link) => (
              <Link
                key={link.slug}
                href={`/note/${link.slug}`}
                className="block rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors group"
              >
                <span className="text-sm font-medium text-[var(--color-accent-hover)] group-hover:underline">
                  {link.title}
                </span>
                {link.context && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2 leading-relaxed">
                    {link.context}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
      {backlinks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            {t('linked_from')} ({backlinks.length})
          </h3>
          <div className="space-y-2">
            {backlinks.map((link) => (
              <Link
                key={link.slug}
                href={`/note/${link.slug}`}
                className="block rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors group"
              >
                <span className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-hover)] transition-colors">
                  {link.title}
                </span>
                {link.context && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2 leading-relaxed">
                    {link.context}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
