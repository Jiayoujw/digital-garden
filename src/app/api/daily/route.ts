import { NextResponse } from 'next/server';
import { listDailyNotes } from '@/lib/fs-utils';

export async function GET() {
  const notes = await listDailyNotes();
  return NextResponse.json(notes);
}
