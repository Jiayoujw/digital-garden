import { NextRequest, NextResponse } from 'next/server';
import { createSearchEngine, getSearchEngine, search } from '@/lib/search-engine';
import { listNotes, readNote } from '@/lib/fs-utils';
import type { Note } from '@/lib/types';

async function loadAllNotes(): Promise<Note[]> {
  const summaries = await listNotes();
  const notes: Note[] = [];
  for (const s of summaries) {
    try {
      const note = await readNote(s.slug);
      notes.push(note);
    } catch { /* skip unreadable notes */ }
  }
  return notes;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 1) {
    return NextResponse.json([]);
  }

  // Use cached engine if available, otherwise build
  let engine = getSearchEngine();
  if (!engine) {
    const notes = await loadAllNotes();
    engine = createSearchEngine(notes);
  }

  const results = search(q).slice(0, 20).map((r) => ({
    slug: r.item.slug,
    title: r.item.frontmatter.title,
    tags: r.item.frontmatter.tags,
    updated: r.item.frontmatter.updated,
    score: r.score,
    snippet: r.item.content.slice(0, 150),
  }));
  return NextResponse.json(results);
}
