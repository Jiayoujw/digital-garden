'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import type { GraphData, GraphNode } from '@/lib/types';

interface Graph3DProps {
  graphData: GraphData;
  onNodeClick: (slug: string) => void;
  focusSlug?: string | null;
  searchQuery?: string;
}

function getNeighbors(nodeId: string, links: any[]): Set<string> {
  const neighbors = new Set<string>();
  for (const l of links) {
    const src = typeof l.source === 'string' ? l.source : l.source.id;
    const tgt = typeof l.target === 'string' ? l.target : l.target.id;
    if (src === nodeId) neighbors.add(tgt);
    if (tgt === nodeId) neighbors.add(src);
  }
  return neighbors;
}

export function Graph3D({ graphData, onNodeClick, focusSlug, searchQuery }: Graph3DProps) {
  const [ForceGraph, setForceGraph] = useState<any>(null);
  const [SpriteText, setSpriteText] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    Promise.all([import('react-force-graph-3d'), import('three-spritetext')]).then(
      ([graphMod, spriteMod]) => {
        setForceGraph(() => graphMod.default);
        setSpriteText(() => spriteMod.default);
      }
    );
  }, []);

  useEffect(() => {
    if (focusSlug && fgRef.current) {
      const node = graphData.nodes.find((n) => n.id === focusSlug);
      if (node && node.x != null && node.y != null && node.z != null) {
        setTimeout(() => {
          try {
            fgRef.current.cameraPosition(
              { x: node.x! + 30, y: node.y! + 30, z: node.z! + 50 },
              { x: node.x!, y: node.y!, z: node.z! },
              1000
            );
          } catch {}
        }, 500);
      }
    }
  }, [focusSlug, graphData]);

  const handleNodeClick = useCallback(
    (node: GraphNode) => onNodeClick(node.id),
    [onNodeClick]
  );

  const handleNodeHover = useCallback(
    (node: GraphNode | null) => setHoveredNode(node),
    []
  );

  const getNodeColor = (node: GraphNode) => {
    if (node.ghost) return '#ef4444';
    if (hoveredNode) {
      const neighbors = getNeighbors(hoveredNode.id, graphData.links);
      if (node.id === hoveredNode.id) return node.color ?? '#818cf8';
      if (neighbors.has(node.id)) return node.color ?? '#6366f1';
      return node.color ?? '#6366f1';
    }
    return node.color ?? '#6366f1';
  };

  const getNodeOpacity = (node: GraphNode) => {
    if (hoveredNode) {
      const neighbors = getNeighbors(hoveredNode.id, graphData.links);
      if (node.id === hoveredNode.id || neighbors.has(node.id)) return 1;
      return 0.15;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = node.name.toLowerCase().includes(q) || node.id.toLowerCase().includes(q);
      return matches ? 1 : 0.15;
    }
    return 1;
  };

  const getLinkColor = (link: any) => {
    if (hoveredNode) {
      const srcId = typeof link.source === 'string' ? link.source : link.source.id;
      const tgtId = typeof link.target === 'string' ? link.target : link.target.id;
      return (srcId === hoveredNode.id || tgtId === hoveredNode.id) ? '#6366f188' : '#2a2a3a11';
    }
    return '#2a2a3a44';
  };

  const nodeThreeObject = useCallback(
    (node: any) => {
      if (!SpriteText) return null;
      const isHovered = hoveredNode?.id === node.id;
      const sprite = new SpriteText(node.name);
      sprite.textHeight = isHovered ? 5 : 3.5;
      sprite.color = isHovered ? '#ffffff' : (node.color ?? '#6366f1');
      return sprite;
    },
    [SpriteText, hoveredNode]
  );

  if (!ForceGraph) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ForceGraph
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeVal={(node: GraphNode) => Math.min(node.val * 4, 25)}
        nodeColor={getNodeColor}
        nodeOpacity={getNodeOpacity}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={true}
        linkColor={getLinkColor}
        linkWidth={(link: any) => {
          if (link.ghost) return 0.3;
          if (hoveredNode) {
            const srcId = typeof link.source === 'string' ? link.source : link.source.id;
            const tgtId = typeof link.target === 'string' ? link.target : link.target.id;
            return (srcId === hoveredNode.id || tgtId === hoveredNode.id) ? 1.5 : 0.2;
          }
          return 0.6;
        }}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        backgroundColor="#0f0f14"
        enableNodeDrag={true}
        showNavInfo={false}
      />
    </div>
  );
}
