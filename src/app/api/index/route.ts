import { NextResponse } from 'next/server';
import { buildGraphIndex } from '@/lib/graph-builder';
import { computeClusters, applyClusterColors } from '@/lib/cluster-engine';
import fs from 'fs/promises';
import path from 'path';

export async function POST() {
  const graphData = await buildGraphIndex();
  const clusters = computeClusters(graphData);
  applyClusterColors(graphData, clusters);
  const indexPath = path.join(process.cwd(), 'data', 'graph-index.json');
  await fs.mkdir(path.dirname(indexPath), { recursive: true });
  await fs.writeFile(indexPath, JSON.stringify({ graphData, clusters }, null, 2), 'utf-8');
  return NextResponse.json({ ok: true, nodeCount: graphData.nodes.length, linkCount: graphData.links.length });
}
