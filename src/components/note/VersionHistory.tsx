'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface CommitEntry {
  sha: string;
  message: string;
  date: string;
  author: string;
}

interface VersionHistoryProps {
  slug: string;
  currentContent: string;
  onRestore: (content: string) => void;
}

export function VersionHistory({ slug, currentContent, onRestore }: VersionHistoryProps) {
  const { locale } = useLanguage();
  const dateLocale = locale === 'zh' ? zhCN : enUS;
  const [commits, setCommits] = useState<CommitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSha, setSelectedSha] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [diffMode, setDiffMode] = useState<'unified'>('unified');

  useEffect(() => {
    fetch(`/api/notes/${slug}/history`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCommits(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const viewVersion = useCallback(
    async (sha: string) => {
      if (selectedSha === sha) {
        setSelectedSha(null);
        setSelectedContent(null);
        return;
      }
      setSelectedSha(sha);
      try {
        // Fetch the file content at this commit
        const token = '';
        const res = await fetch(
          `/api/notes/${slug}?v=${sha}`
        );
        if (res.ok) {
          const data = await res.json();
          setSelectedContent(data.content ?? '');
        }
      } catch {
        setSelectedContent(null);
      }
    },
    [slug, selectedSha]
  );

  const handleRestore = useCallback(async () => {
    if (!selectedContent) return;
    setRestoring(true);
    onRestore(selectedContent);
    setRestoring(false);
    setSelectedSha(null);
    setSelectedContent(null);
  }, [selectedContent, onRestore]);

  // Simple line diff computation
  const diffLines = (() => {
    if (!selectedContent) return null;
    const oldLines = selectedContent.split('\n');
    const newLines = currentContent.split('\n');
    const result: { type: 'add' | 'remove' | 'same'; text: string; num?: number }[] = [];
    const maxLen = Math.max(oldLines.length, newLines.length);

    // Simple LCS-based approach for display
    for (let i = 0; i < maxLen; i++) {
      if (i < newLines.length) {
        const inOld = oldLines.includes(newLines[i]);
        if (!inOld) {
          result.push({ type: 'add', text: newLines[i], num: i + 1 });
        } else {
          result.push({ type: 'same', text: newLines[i], num: i + 1 });
        }
      }
      if (i < oldLines.length) {
        const inNew = newLines.includes(oldLines[i]);
        if (!inNew) {
          result.push({ type: 'remove', text: oldLines[i], num: i + 1 });
        }
      }
    }
    return result;
  })();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] py-4">
        <div className="animate-spin w-3 h-3 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
        Loading history...
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <p className="text-xs text-[var(--color-text-muted)] py-4">
        {locale === 'zh' ? '暂无版本历史（仅 GitHub 存储支持）' : 'No version history (GitHub storage only)'}
      </p>
    );
  }

  return (
    <div className="mt-6 border-t border-[var(--color-border)] pt-4">
      <h3 className="text-sm font-semibold mb-3">
        {locale === 'zh' ? '版本历史' : 'Version History'}
        <span className="ml-2 text-xs font-normal text-[var(--color-text-muted)]">
          ({commits.length} commits)
        </span>
      </h3>

      <div className="flex gap-4">
        {/* Commit list */}
        <div className="w-72 shrink-0 max-h-64 overflow-y-auto space-y-1">
          {commits.map((commit) => (
            <button
              key={commit.sha}
              onClick={() => viewVersion(commit.sha)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                selectedSha === commit.sha
                  ? 'bg-[var(--color-accent-subtle)] ring-1 ring-[var(--color-accent)]'
                  : 'hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              <div className="font-medium text-[var(--color-text-primary)] truncate">
                {commit.message.replace(/^(Update note:|Create note:)\s*/, '')}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                {format(parseISO(commit.date), 'MMM d, yyyy HH:mm', { locale: dateLocale })}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)]">
                {commit.sha} · {commit.author}
              </div>
            </button>
          ))}
        </div>

        {/* Diff / Preview */}
        <div className="flex-1 min-h-[100px] max-h-64 overflow-y-auto bg-[var(--color-bg-tertiary)] rounded-lg p-3 text-xs">
          {!selectedSha ? (
            <p className="text-[var(--color-text-muted)] text-center pt-8">
              {locale === 'zh' ? '选择左侧的版本以查看对比' : 'Select a version from the left to compare'}
            </p>
          ) : !diffLines ? (
            <p className="text-[var(--color-text-muted)] text-center pt-8">Loading...</p>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--color-text-muted)]">
                  {locale === 'zh' ? `版本 ${selectedSha} → 当前` : `Version ${selectedSha} → current`}
                </span>
                <button
                  onClick={handleRestore}
                  disabled={restoring}
                  className="px-2 py-1 rounded text-[10px] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
                >
                  {restoring
                    ? locale === 'zh'
                      ? '恢复中...'
                      : 'Restoring...'
                    : locale === 'zh'
                      ? '恢复此版本'
                      : 'Restore this version'}
                </button>
              </div>
              <div className="font-mono leading-relaxed">
                {diffLines.map((line, i) => (
                  <div
                    key={i}
                    className={`${
                      line.type === 'add'
                        ? 'bg-[var(--color-success)] bg-opacity-10 text-[var(--color-success)]'
                        : line.type === 'remove'
                          ? 'bg-[var(--color-danger)] bg-opacity-10 text-[var(--color-danger)] line-through'
                          : 'text-[var(--color-text-secondary)]'
                    } px-1`}
                  >
                    <span className="text-[var(--color-text-muted)] mr-2 select-none">
                      {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                    </span>
                    {line.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
