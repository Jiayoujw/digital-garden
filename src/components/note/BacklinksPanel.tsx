'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { NoteSummary } from '@/lib/types';

interface BacklinksPanelProps {
  slug: string;
}

export function BacklinksPanel({ slug }: BacklinksPanelProps) {
  const [backlinks, setBacklinks] = useState<NoteSummary[]>([]);
  const [forwardLinks, setForwardLinks] = useState<NoteSummary[]>([]);

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
    <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
      {forwardLinks.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Links to
          </h3>
          <div className="flex flex-wrap gap-2">
            {forwardLinks.map((link) => (
              <Link
                key={link.slug}
                href={`/note/${link.slug}`}
                className="px-3 py-1.5 rounded-lg text-sm bg-[var(--color-accent-subtle)] text-[var(--color-accent-hover)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      )}
      {backlinks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Linked from
          </h3>
          <div className="flex flex-wrap gap-2">
            {backlinks.map((link) => (
              <Link
                key={link.slug}
                href={`/note/${link.slug}`}
                className="px-3 py-1.5 rounded-lg text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent-hover)] transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
