import type { GraphData, Cluster } from './types';

const PALETTE = [
  '#e6194b', '#3cb44b', '#ffe119', '#0082c8', '#f58231',
  '#911eb4', '#46f0f0', '#f032e6', '#d2f53c', '#fabebe',
  '#008080', '#e6beff', '#aa6e28', '#800000', '#aaffc3',
];

export function computeClusters(graphData: GraphData): Cluster[] {
  // Exclude ghost nodes from clustering
  const realNodes = graphData.nodes.filter((n) => !n.ghost);
  if (realNodes.length === 0) return [];

  const adjacency = new Map<string, Set<string>>();
  for (const n of realNodes) adjacency.set(n.id, new Set());
  for (const l of graphData.links) {
    if (l.ghost) continue;
    adjacency.get(l.source)?.add(l.target);
    adjacency.get(l.target)?.add(l.source);
  }

  const nodeIds = realNodes.map((n) => n.id);
  const simGraph = new Map<string, Set<string>>();
  for (const id of nodeIds) simGraph.set(id, new Set());

  const SIM_THRESHOLD = 0.15;
  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      const a = adjacency.get(nodeIds[i])!;
      const b = adjacency.get(nodeIds[j])!;
      if (a.size === 0 && b.size === 0) continue;
      const intersect = new Set([...a].filter((x) => b.has(x)));
      const union = new Set([...a, ...b]);
      const sim = union.size === 0 ? 0 : intersect.size / union.size;
      if (sim >= SIM_THRESHOLD) {
        simGraph.get(nodeIds[i])!.add(nodeIds[j]);
        simGraph.get(nodeIds[j])!.add(nodeIds[i]);
      }
    }
  }

  const visited = new Set<string>();
  const rawClusters: string[][] = [];
  for (const id of nodeIds) {
    if (visited.has(id)) continue;
    const component: string[] = [];
    const queue = [id];
    visited.add(id);
    while (queue.length) {
      const cur = queue.shift()!;
      component.push(cur);
      for (const neighbor of simGraph.get(cur)!) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    rawClusters.push(component);
  }

  return rawClusters.map((slugs, i) => {
    const color = PALETTE[i % PALETTE.length];
    const label = findDominantTag(slugs, graphData) ?? `Cluster ${i + 1}`;
    return { id: `cluster-${i}`, label, color, noteSlugs: slugs, noteCount: slugs.length };
  });
}

function findDominantTag(slugs: string[], graphData: GraphData): string | null {
  const tagCounts = new Map<string, number>();
  for (const slug of slugs) {
    const node = graphData.nodes.find((n) => n.id === slug);
    if (node) {
      for (const tag of node.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
  }
  if (tagCounts.size === 0) return null;
  return [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function applyClusterColors(graphData: GraphData, clusters: Cluster[]): void {
  for (const cluster of clusters) {
    for (const slug of cluster.noteSlugs) {
      const node = graphData.nodes.find((n) => n.id === slug);
      if (node) {
        node.color = cluster.color;
        node.group = cluster.id;
      }
    }
  }
}
