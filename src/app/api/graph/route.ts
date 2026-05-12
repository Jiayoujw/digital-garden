import { NextResponse } from 'next/server';
import { buildGraphIndex } from '@/lib/graph-builder';
import { computeClusters, applyClusterColors } from '@/lib/cluster-engine';

export async function GET() {
  const graphData = await buildGraphIndex();
  const clusters = computeClusters(graphData);
  applyClusterColors(graphData, clusters);

  // Build enriched cluster info for frontend
  const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n.name]));
  const clusterMeta = clusters.map((c) => ({
    id: c.id,
    label: c.label,
    color: c.color,
    noteSlugs: c.noteSlugs,
    noteCount: c.noteCount,
  }));

  return NextResponse.json({ ...graphData, clusters: clusterMeta });
}
