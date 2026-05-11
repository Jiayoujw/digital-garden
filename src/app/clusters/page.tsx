'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Cluster } from '@/lib/types';

export default function ClustersPage() {
  const { t } = useLanguage();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clusters')
      .then((r) => r.json())
      .then((data) => {
        setClusters(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-6">
      <h1 className="text-2xl font-bold mb-2">{t('topic_clusters')}</h1>
      <p className="text-[var(--color-text-secondary)] mb-8 text-sm">
        {t('clusters_desc')}
      </p>

      {clusters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-4xl">⬡</span>
          <p className="text-[var(--color-text-muted)] text-lg">
            {t('no_clusters_yet')}
          </p>
          <p className="text-[var(--color-text-muted)] text-sm">
            {t('no_clusters_desc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {clusters.map((cluster) => (
            <div
              key={cluster.id}
              className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cluster.color }}
                />
                <h3 className="font-semibold text-lg">{cluster.label}</h3>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mb-3">
                {cluster.noteCount} {cluster.noteCount === 1 ? t('note_singular') : t('note_plural')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cluster.noteSlugs.slice(0, 8).map((slug) => (
                  <Link
                    key={slug}
                    href={`/note/${slug}`}
                    className="px-2 py-1 rounded-md text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent-hover)] transition-colors"
                  >
                    {slug}
                  </Link>
                ))}
                {cluster.noteSlugs.length > 8 && (
                  <span className="px-2 py-1 rounded-md text-xs text-[var(--color-text-muted)]">
                    {t('more_suffix', { n: cluster.noteSlugs.length - 8 })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
