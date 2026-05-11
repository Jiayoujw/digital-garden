import { NextResponse } from 'next/server';
import { buildGraphIndex } from '@/lib/graph-builder';
import { computeClusters } from '@/lib/cluster-engine';

export async function GET() {
  const graphData = await buildGraphIndex();
  const clusters = computeClusters(graphData);
  return NextResponse.json(clusters);
}
