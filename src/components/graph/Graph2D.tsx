'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import type { GraphData, GraphNode } from '@/lib/types';

interface Graph2DProps {
  graphData: GraphData;
  onNodeClick: (slug: string) => void;
}

export function Graph2D({ graphData, onNodeClick }: Graph2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ForceGraph2D, setForceGraph2D] = useState<any>(null);

  useEffect(() => {
    import('react-force-graph-2d').then((mod) => setForceGraph2D(() => mod.default));
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNode) => onNodeClick(node.id),
    [onNodeClick]
  );

  if (!ForceGraph2D) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeVal={(node: GraphNode) => Math.min(node.val * 3, 20)}
        nodeColor={(node: GraphNode) => node.color ?? '#6366f1'}
        linkColor={() => '#2a2a3a55'}
        linkWidth={1}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px system-ui`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#e0e0e8';
          const r = Math.min(node.val * 3, 20);
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = node.color ?? '#6366f1';
          ctx.fill();
          if (globalScale > 0.8) {
            ctx.fillStyle = '#e0e0e8';
            ctx.fillText(label, node.x, node.y + r + fontSize * 0.8);
          }
        }}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
}


