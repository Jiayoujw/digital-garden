'use client';

import { useState } from 'react';

interface ClusterInfo {
  id: string;
  label: string;
  color: string;
  noteCount: number;
}

interface ClusterLegendProps {
  clusters: ClusterInfo[];
}

export function ClusterLegend({ clusters }: ClusterLegendProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (clusters.length === 0) return null;

  return (
    <div className="absolute bottom-4 right-4 z-10 max-w-[180px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-3 shadow-xl">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-between w-full mb-2"
      >
        <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Clusters
        </span>
        <svg
          className={`w-3 h-3 text-[var(--color-text-muted)] transition-transform ${collapsed ? '' : 'rotate-180'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {!collapsed && (
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {clusters.map((c) => (
            <div key={c.id} className="flex items-center gap-2 text-[11px]">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span className="text-[var(--color-text-secondary)] truncate">{c.label}</span>
              <span className="text-[var(--color-text-muted)] ml-auto tabular-nums">{c.noteCount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
