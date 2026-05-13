import { NextRequest, NextResponse } from 'next/server';
import { readNote, listNotes } from '@/lib/fs-utils';
import { getBacklinks } from '@/lib/graph-builder';
import { buildGraphIndex } from '@/lib/graph-builder';

function extractContext(content: string, targetSlug: string): string | null {
  const escaped = targetSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\[\\[${escaped}(?:\\|[^\\]]+)?\\]\\]`, 'gi');
  const match = pattern.exec(content);
  if (!match) return null;

  const idx = match.index;
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + match[0].length + 40);
  let snippet = content.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  // Highlight the wikilink
  snippet = snippet.replace(match[0], `**${match[0]}**`);
  return snippet;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const note = await readNote(slug).catch(() => null);
  if (!note) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  // Backlinks: notes that link TO this one
  const backlinks = await getBacklinks(slug);

  // Forward links: notes this note links TO
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

  // Add context snippets for backlinks
  const backWithContext = await Promise.all(
    backlinks.map(async (b) => {
      try {
        const sourceNote = await readNote(b.slug);
        const context = extractContext(sourceNote.content, slug);
        return { ...b, context };
      } catch {
        return { ...b, context: null };
      }
    })
  );

  // Add context snippets for forward links (from current note)
  const forwardWithContext = forwardLinks.map((f) => {
    const context = extractContext(note.content, f!.slug);
    return { ...f!, context };
  });

  return NextResponse.json({ forward: forwardWithContext, back: backWithContext });
}
