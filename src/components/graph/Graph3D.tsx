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

// Create a glowing sphere for each node
function createGlowNode(color: string, size: number, SpriteText: any, label: string) {
  // We'll use this in nodeThreeObject
  return null;
}

export function Graph3D({ graphData, onNodeClick, focusSlug, searchQuery }: Graph3DProps) {
  const [ForceGraph, setForceGraph] = useState<any>(null);
  const [SpriteText, setSpriteText] = useState<any>(null);
  const [THREE, setTHREE] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const fgRef = useRef<any>(null);
  const starfieldRef = useRef<any>(null);

  useEffect(() => {
    Promise.all([
      import('react-force-graph-3d'),
      import('three-spritetext'),
      import('three'),
    ]).then(([graphMod, spriteMod, threeMod]) => {
      setForceGraph(() => graphMod.default);
      setSpriteText(() => spriteMod.default);
      setTHREE(threeMod);
    });
  }, []);

  // Auto-focus on search result
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

  // Starfield background
  useEffect(() => {
    if (!THREE || !fgRef.current) return;

    const setupStarfield = () => {
      const scene = fgRef.current.scene();
      if (!scene) return;

      // Remove old starfield if exists
      if (starfieldRef.current) {
        scene.remove(starfieldRef.current);
      }

      // Create starfield
      const starsGeo = new THREE.BufferGeometry();
      const starCount = 800;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount; i++) {
        // Distribute in a large sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 200 + Math.random() * 300;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Subtle color variations: white, blue-tinted, purple-tinted
        const colorChoice = Math.random();
        if (colorChoice < 0.4) {
          colors[i * 3] = 0.6 + Math.random() * 0.4;
          colors[i * 3 + 1] = 0.6 + Math.random() * 0.4;
          colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
        } else if (colorChoice < 0.7) {
          colors[i * 3] = 0.8 + Math.random() * 0.2;
          colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
          colors[i * 3 + 2] = 0.5 + Math.random() * 0.3;
        } else {
          colors[i * 3] = 0.4 + Math.random() * 0.3;
          colors[i * 3 + 1] = 0.5 + Math.random() * 0.4;
          colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
        }
      }

      starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const starsMat = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.7,
      });

      const starfield = new THREE.Points(starsGeo, starsMat);
      starfieldRef.current = starfield;
      scene.add(starfield);

      // Slowly rotate the starfield
      const animate = () => {
        if (starfieldRef.current) {
          starfieldRef.current.rotation.y += 0.00005;
          starfieldRef.current.rotation.x += 0.00002;
        }
        requestAnimationFrame(animate);
      };
      animate();
    };

    // Wait for engine to initialize
    const timer = setTimeout(setupStarfield, 1500);
    return () => clearTimeout(timer);
  }, [THREE, ForceGraph]);

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
      if (node.id === hoveredNode.id) return '#c4b5fd';
      if (neighbors.has(node.id)) return node.color ?? '#818cf8';
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
      return (srcId === hoveredNode.id || tgtId === hoveredNode.id)
        ? '#6366f188'
        : '#2a2a3a11';
    }
    return '#2a2a3a44';
  };

  const nodeThreeObject = useCallback(
    (node: any) => {
      if (!SpriteText || !THREE) return null;
      const isHovered = hoveredNode?.id === node.id;

      // Create a group with glow ring + sprite label
      const group = new THREE.Group();

      // Glow ring around focused/hovered nodes
      if (isHovered || node.ghost) {
        const ringGeo = new THREE.TorusGeometry(node.val * 0.5 + 1.5, 0.3, 16, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: node.ghost ? '#ef4444' : '#6366f1',
          transparent: true,
          opacity: 0.6,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        group.add(ring);
      }

      // Sprite label
      const sprite = new SpriteText(node.name);
      sprite.textHeight = isHovered ? 5 : 3.5;
      sprite.color = isHovered ? '#ffffff' : node.color ?? '#818cf8';
      group.add(sprite);

      return group;
    },
    [SpriteText, THREE, hoveredNode]
  );

  const getLinkDirectionalParticleColor = useCallback(
    (link: any) => {
      if (hoveredNode) {
        const srcId = typeof link.source === 'string' ? link.source : link.source.id;
        const tgtId = typeof link.target === 'string' ? link.target : link.target.id;
        return (srcId === hoveredNode.id || tgtId === hoveredNode.id)
          ? '#818cf8'
          : '#2a2a3a';
      }
      return '#6366f1';
    },
    [hoveredNode]
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
        linkDirectionalParticles={3}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={1.2}
        linkDirectionalParticleColor={getLinkDirectionalParticleColor}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        cooldownTicks={120}
        d3AlphaDecay={0.015}
        d3VelocityDecay={0.35}
        backgroundColor="#0f0f14"
        enableNodeDrag={true}
        showNavInfo={false}
      />
    </div>
  );
}
