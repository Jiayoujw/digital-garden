'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Graph2D } from '@/components/graph/Graph2D';
import { Graph3D } from '@/components/graph/Graph3D';
import { GraphControls } from '@/components/graph/GraphControls';
import { ClusterLegend } from '@/components/graph/ClusterLegend';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { GraphData } from '@/lib/types';

interface ClusterMeta {
  id: string;
  label: string;
  color: string;
  noteSlugs: string[];
  noteCount: number;
}

interface EnrichedGraphData extends GraphData {
  clusters?: ClusterMeta[];
}

export default function GraphPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [graphData, setGraphData] = useState<EnrichedGraphData>({ nodes: [], links: [] });
  const [clusters, setClusters] = useState<ClusterMeta[]>([]);
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/graph')
      .then((r) => r.json())
      .then((data: EnrichedGraphData) => {
        const { clusters: c, ...gData } = data;
        setGraphData(gData);
        if (c) setClusters(c);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Auto-focus on the best search match
  const focusSlug = (() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const best = graphData.nodes.find(
      (n) => n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
    );
    return best?.id ?? null;
  })();

  const handleNodeClick = useCallback((slug: string) => {
    router.push(`/note/${slug}`);
  }, [router]);

  const handleClearFocus = useCallback(() => {
    setSearchQuery('');
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-[var(--color-text-muted)] text-lg">{t('no_graph_data')}</p>
        <p className="text-[var(--color-text-muted)] text-sm">
          {t('no_graph_data_desc')}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GraphControls
        mode={mode}
        onModeChange={setMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        focusSlug={focusSlug}
        onClearFocus={handleClearFocus}
      />
      {mode === '2d' ? (
        <Graph2D
          graphData={graphData}
          onNodeClick={handleNodeClick}
          focusSlug={focusSlug}
          searchQuery={searchQuery}
          clusters={clusters}
        />
      ) : (
        <Graph3D
          graphData={graphData}
          onNodeClick={handleNodeClick}
          focusSlug={focusSlug}
          searchQuery={searchQuery}
        />
      )}
      <ClusterLegend clusters={clusters} />
    </div>
  );
}
