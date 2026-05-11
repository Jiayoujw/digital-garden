import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { createSearchEngine, search } from '@/lib/search-engine';
import type { Note } from '@/lib/types';
import { NOTES_DIR, ensureDirectories } from '@/lib/data-dir';

async function loadAllNotes(): Promise<Note[]> {
  await ensureDirectories();
  const files = await fs.readdir(NOTES_DIR);
  const mdFiles = files.filter((f) => f.endsWith('.md'));
  const notes: Note[] = [];
  for (const file of mdFiles) {
    const rawContent = await fs.readFile(path.join(NOTES_DIR, file), 'utf-8');
    const parsed = matter(rawContent);
    notes.push({
      slug: file.replace(/\.md$/, ''),
      path: file,
      frontmatter: {
        title: parsed.data.title ?? file.replace(/\.md$/, ''),
        tags: parsed.data.tags ?? [],
        created: parsed.data.created ?? '',
        updated: parsed.data.updated ?? '',
      },
      content: parsed.content,
      rawContent,
    });
  }
  return notes;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 1) {
    return NextResponse.json([]);
  }
  const notes = await loadAllNotes();
  createSearchEngine(notes);
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
