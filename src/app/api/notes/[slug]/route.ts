import { NextRequest, NextResponse } from 'next/server';
import { readNote, writeNote, deleteNote } from '@/lib/fs-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const note = await readNote(slug);
    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  try {
    const note = await writeNote(slug, body.content ?? '', {
      title: body.title ?? slug,
      tags: body.tags ?? [],
    });
    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    await deleteNote(slug);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }
}
