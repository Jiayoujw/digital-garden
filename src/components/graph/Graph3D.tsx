'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import type { GraphData, GraphNode } from '@/lib/types';

interface Graph3DProps {
  graphData: GraphData;
  onNodeClick: (slug: string) => void;
}

export function Graph3D({ graphData, onNodeClick }: Graph3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ForceGraph, setForceGraph] = useState<any>(null);
  const [SpriteText, setSpriteText] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      import('react-force-graph-3d'),
      import('three-spritetext'),
    ]).then(([graphMod, spriteMod]) => {
      setForceGraph(() => graphMod.default);
      setSpriteText(() => spriteMod.default);
    });
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNode) => onNodeClick(node.id),
    [onNodeClick]
  );

  const nodeThreeObject = useCallback(
    (node: any) => {
      if (!SpriteText) return null;
      const sprite = new SpriteText(node.name);
      sprite.textHeight = 3;
      sprite.color = node.color ?? '#6366f1';
      return sprite;
    },
    [SpriteText]
  );

  if (!ForceGraph) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph
        graphData={graphData}
        nodeLabel="name"
        nodeVal={(node: GraphNode) => Math.min(node.val * 3, 20)}
        nodeColor={(node: GraphNode) => node.color ?? '#6366f1'}
        nodeThreeObject={nodeThreeObject}
        linkColor={() => '#2a2a3a55'}
        linkWidth={1}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        backgroundColor="#0f0f14"
      />
    </div>
  );
}
