import { NextRequest, NextResponse } from 'next/server';
import { readDailyNote, writeDailyNote } from '@/lib/fs-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format (YYYY-MM-DD)' }, { status: 400 });
  }
  let note = await readDailyNote(date);
  if (!note) {
    note = await writeDailyNote(date, '');
  }
  return NextResponse.json(note);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format (YYYY-MM-DD)' }, { status: 400 });
  }
  const body = await request.json();
  const note = await writeDailyNote(date, body.content ?? '');
  return NextResponse.json(note);
}
