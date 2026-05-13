import { NextRequest, NextResponse } from 'next/server';
import { listNotes, readNote } from '@/lib/fs-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const token = process.env.ANTHROPIC_AUTH_TOKEN;
  if (!token) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const currentNote = await readNote(slug);
    const allNotes = await listNotes();
    const others = allNotes.filter((n) => n.slug !== slug);

    if (others.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Build a compact list of other notes
    const noteList = others
      .map((n) => `- "${n.title}" (slug: ${n.slug}, tags: ${n.tags.join(', ') || 'none'})`)
      .join('\n');

    const prompt = `You are analyzing notes in a digital garden (personal knowledge base with [[wikilinks]]).

Current note title: "${currentNote.frontmatter.title}"
Current note tags: ${currentNote.frontmatter.tags.join(', ') || 'none'}
Current note content (truncated):
---
${currentNote.content.slice(0, 3000)}
---

Available notes to potentially link to:
${noteList.slice(0, 4000)}

Based on the content and topic of the current note, pick the 3 most relevant notes that SHOULD be linked via [[wikilinks]]. Consider:
1. Direct topic overlap
2. Complementary knowledge
3. Notes that would benefit from a bidirectional link

Return ONLY a JSON array of slugs, like: ["slug1", "slug2", "slug3"]
Do not include any other text.`;

    const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
    const res = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': token,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const data = await res.json();
    const raw = data.content?.[0]?.text || '[]';
    // Parse the JSON array from the response
    const match = raw.match(/\[[\s\S]*?\]/);
    if (!match) return NextResponse.json({ suggestions: [] });

    const slugs: string[] = JSON.parse(match[0]);
    // Filter to valid slugs only
    const validSlugs = new Set(others.map((n) => n.slug));
    const filtered = slugs.filter((s) => validSlugs.has(s)).slice(0, 3);

    const suggestions = filtered.map((s) => {
      const note = others.find((n) => n.slug === s);
      return { slug: s, title: note?.title ?? s };
    });

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
