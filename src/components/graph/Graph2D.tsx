'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import type { GraphData, GraphNode } from '@/lib/types';

interface ClusterMeta {
  id: string;
  label: string;
  color: string;
  noteSlugs: string[];
  noteCount: number;
}

interface Graph2DProps {
  graphData: GraphData;
  onNodeClick: (slug: string) => void;
  focusSlug?: string | null;
  searchQuery?: string;
  clusters?: ClusterMeta[];
}

function getNeighbors(nodeId: string, links: { source: string | { id: string }; target: string | { id: string } }[]): Set<string> {
  const neighbors = new Set<string>();
  for (const l of links) {
    const src = typeof l.source === 'string' ? l.source : l.source.id;
    const tgt = typeof l.target === 'string' ? l.target : l.target.id;
    if (src === nodeId) neighbors.add(tgt);
    if (tgt === nodeId) neighbors.add(src);
  }
  return neighbors;
}

export function Graph2D({ graphData, onNodeClick, focusSlug, searchQuery, clusters }: Graph2DProps) {
  const [ForceGraph, setForceGraph] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [clusterCentroids, setClusterCentroids] = useState<Array<{ id: string; label: string; color: string; x: number; y: number }>>([]);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    import('react-force-graph-2d').then((mod) => setForceGraph(() => mod.default));
  }, []);

  // Focus mode: zoom to focused node
  useEffect(() => {
    if (focusSlug && fgRef.current) {
      const node = graphData.nodes.find((n) => n.id === focusSlug);
      if (node && node.x != null && node.y != null) {
        setTimeout(() => {
          try {
            fgRef.current.centerAt(node.x!, node.y!, 1000);
            fgRef.current.zoom(3, 1000);
          } catch {}
        }, 500);
      }
    } else if (!focusSlug && fgRef.current) {
      try {
        fgRef.current.zoomToFit(1000, 50);
      } catch {}
    }
  }, [focusSlug, graphData]);

  // Compute cluster centroids after simulation settles
  useEffect(() => {
    if (!clusters || !fgRef.current) return;
    const timer = setTimeout(() => {
      try {
        const centroids = clusters.map((cluster) => {
          const clusterNodes = graphData.nodes.filter((n) => cluster.noteSlugs.includes(n.id) && !n.ghost);
          if (clusterNodes.length === 0) return null;
          const avgX = clusterNodes.reduce((s, n) => s + (n.x ?? 0), 0) / clusterNodes.length;
          const avgY = clusterNodes.reduce((s, n) => s + (n.y ?? 0), 0) / clusterNodes.length;
          return { id: cluster.id, label: cluster.label, color: cluster.color, x: avgX, y: avgY };
        }).filter(Boolean) as Array<{ id: string; label: string; color: string; x: number; y: number }>;
        setClusterCentroids(centroids);
      } catch {}
    }, 2500);
    return () => clearTimeout(timer);
  }, [clusters, graphData]);

  const handleNodeClick = useCallback(
    (node: GraphNode) => onNodeClick(node.id),
    [onNodeClick]
  );

  const handleNodeHover = useCallback(
    (node: GraphNode | null, _prev: GraphNode | null, event?: MouseEvent) => {
      setHoveredNode(node);
      if (node && event) {
        setTooltipPos({ x: event.clientX, y: event.clientY });
      }
    },
    []
  );

  const getNodeColor = (node: GraphNode) => {
    if (node.ghost) return '#ef4444';
    if (hoveredNode) {
      const neighbors = getNeighbors(hoveredNode.id, graphData.links);
      if (node.id === hoveredNode.id) return node.color ?? '#818cf8';
      if (neighbors.has(node.id)) return node.color ?? '#6366f1';
      return (node.color ?? '#6366f1') + '22';
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = node.name.toLowerCase().includes(q) || node.id.toLowerCase().includes(q);
      return matches ? (node.color ?? '#818cf8') : (node.color ?? '#6366f1') + '33';
    }
    return node.color ?? '#6366f1';
  };

  const getLinkColor = (link: any) => {
    if (link.ghost) return '#ef444422';
    if (hoveredNode) {
      const srcId = typeof link.source === 'string' ? link.source : link.source.id;
      const tgtId = typeof link.target === 'string' ? link.target : link.target.id;
      const isHighlighted = srcId === hoveredNode.id || tgtId === hoveredNode.id;
      return isHighlighted ? '#6366f155' : '#2a2a3a11';
    }
    return '#2a2a3a44';
  };

  const getLinkWidth = (link: any) => {
    if (link.ghost) return 0.4;
    if (hoveredNode) {
      const srcId = typeof link.source === 'string' ? link.source : link.source.id;
      const tgtId = typeof link.target === 'string' ? link.target : link.target.id;
      return (srcId === hoveredNode.id || tgtId === hoveredNode.id) ? 1.5 : 0.3;
    }
    return 0.6;
  };

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.name;
      const isGhost = node.ghost === true;
      const fontSize = 13 / globalScale;
      const isHovered = hoveredNode?.id === node.id;
      const r = Math.min(node.val * 3, isHovered ? 24 : 18);
      const color = getNodeColor(node as GraphNode);

      // Glow ring for hovered node
      if (isHovered && !isGhost) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 6, 0, 2 * Math.PI);
        ctx.fillStyle = (node.color ?? '#818cf8') + '33';
        ctx.fill();
      }

      // Search highlight ring
      if (searchQuery && !hoveredNode && !isGhost) {
        const q = searchQuery.toLowerCase();
        const matches = node.name.toLowerCase().includes(q) || node.id.toLowerCase().includes(q);
        if (matches) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 5, 0, 2 * Math.PI);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      if (isGhost) {
        // Ghost node: empty circle with dashed red border
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef444411';
        ctx.fill();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#ef444477';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Main node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        // Border
        ctx.strokeStyle = (node.color ?? '#6366f1') + '88';
        ctx.lineWidth = isHovered ? 2 : 0.5;
        ctx.stroke();

        // Count badge if node has many connections
        if (node.val > 3) {
          const badge = Math.round(node.val).toString();
          const badgeFontSize = Math.max(9, fontSize * 0.65);
          ctx.font = `600 ${badgeFontSize}px system-ui`;
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badge, node.x, node.y);
        }
      }

      // Label below node
      if (globalScale > 0.5) {
        ctx.font = `${fontSize}px system-ui`;
        ctx.fillStyle = isGhost ? '#ef444488' : (isHovered ? '#e0e0e8' : '#8888a0');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(label, node.x, node.y + r + 4);
        if (isGhost) {
          ctx.fillStyle = '#ef444466';
          ctx.fillText('(未创建)', node.x, node.y + r + 4 + fontSize + 2);
        }
      }
    },
    [hoveredNode, searchQuery]
  );

  if (!ForceGraph) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ForceGraph
        ref={fgRef}
        graphData={graphData}
        nodeLabel=""
        nodeVal={(node: GraphNode) => Math.min(node.val * 3, 20)}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          const r = Math.min(node.val * 3, 20);
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkDirectionalParticles={hoveredNode ? 2 : 0}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => '#6366f1aa'}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={() => setHoveredNode(null)}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        minZoom={0.3}
        maxZoom={8}
      />

      {/* Cluster centroid labels */}
      {clusterCentroids.map((cc) => (
        <div
          key={cc.id}
          className="absolute z-10 pointer-events-none"
          style={{ left: cc.x, top: cc.y, transform: 'translate(-50%, -50%)' }}
        >
          <span
            className="px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
            style={{
              backgroundColor: cc.color + '18',
              color: cc.color,
              border: `1px solid ${cc.color}33`,
            }}
          >
            {cc.label}
          </span>
        </div>
      ))}

      {/* Hover tooltip */}
      {hoveredNode && (
        <div
          className="absolute z-20 pointer-events-none bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-3 shadow-xl max-w-xs"
          style={{
            left: tooltipPos.x + 16,
            top: tooltipPos.y - 16,
          }}
        >
          <h3 className="text-sm font-semibold mb-1">
            {hoveredNode.name}
            {hoveredNode.ghost && (
              <span className="ml-1.5 text-[10px] text-red-400 align-middle">uncreated</span>
            )}
          </h3>
          {!hoveredNode.ghost && (
            <div className="flex flex-wrap gap-1 mb-1">
              {hoveredNode.tags.slice(0, 4).map((tag: string) => (
                <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--color-text-muted)]">
            {hoveredNode.ghost
              ? 'This note does not exist yet'
              : `${Math.round(hoveredNode.val)} link${hoveredNode.val > 2 ? 's' : ''}`}
          </p>
        </div>
      )}
    </div>
  );
}
