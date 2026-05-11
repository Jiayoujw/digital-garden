'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Graph2D } from '@/components/graph/Graph2D';
import { Graph3D } from '@/components/graph/Graph3D';
import { GraphControls } from '@/components/graph/GraphControls';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { GraphData } from '@/lib/types';

export default function GraphPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/graph')
      .then((r) => r.json())
      .then((data) => {
        setGraphData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleNodeClick = (slug: string) => {
    router.push(`/note/${slug}`);
  };

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
      <GraphControls mode={mode} onModeChange={setMode} />
      {mode === '2d' ? (
        <Graph2D graphData={graphData} onNodeClick={handleNodeClick} />
      ) : (
        <Graph3D graphData={graphData} onNodeClick={handleNodeClick} />
      )}
    </div>
  );
}
