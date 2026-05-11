import { NextRequest, NextResponse } from 'next/server';
import { readNote } from '@/lib/fs-utils';
import { getBacklinks } from '@/lib/graph-builder';
import { buildGraphIndex } from '@/lib/graph-builder';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const note = await readNote(slug).catch(() => null);
  if (!note) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }
  const backlinks = await getBacklinks(slug);
  const graphData = await buildGraphIndex();
  const forwardLinks = graphData.links
    .filter((l) => l.source === slug)
    .map((l) => {
      const node = graphData.nodes.find((n) => n.id === l.target);
      return node
        ? { slug: node.id, title: node.name, tags: node.tags, updated: '' }
        : null;
    })
    .filter(Boolean);
  return NextResponse.json({ forward: forwardLinks, back: backlinks });
}
