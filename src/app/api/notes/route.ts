import { NextRequest, NextResponse } from 'next/server';
import { listNotes, writeNote, slugify } from '@/lib/fs-utils';

export async function GET() {
  const notes = await listNotes();
  return NextResponse.json(notes);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const title: string = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  const slug = slugify(title);
  const note = await writeNote(slug, body.content ?? '', {
    title,
    tags: body.tags ?? [],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  });
  return NextResponse.json(note, { status: 201 });
}
