import { NextResponse } from 'next/server';
import { buildGraphIndex } from '@/lib/graph-builder';
import { computeClusters, applyClusterColors } from '@/lib/cluster-engine';

export async function POST() {
  const graphData = await buildGraphIndex();
  const clusters = computeClusters(graphData);
  applyClusterColors(graphData, clusters);
  return NextResponse.json({ ok: true, nodeCount: graphData.nodes.length, linkCount: graphData.links.length, clusters });
}
