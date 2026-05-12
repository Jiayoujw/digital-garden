import { NextResponse } from 'next/server';
import { buildGraphIndex } from '@/lib/graph-builder';
import { computeClusters } from '@/lib/cluster-engine';

export async function GET() {
  const graphData = await buildGraphIndex();
  const clusters = computeClusters(graphData);

  const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n.name]));
  const enriched = clusters.map((c) => ({
    ...c,
    notes: c.noteSlugs.map((slug) => ({
      slug,
      title: nodeMap.get(slug) ?? slug,
    })),
  }));

  return NextResponse.json(enriched);
}
