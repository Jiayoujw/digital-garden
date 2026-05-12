import type { Note, NoteFrontmatter, NoteSummary, DailyNoteSummary } from './types';
import { getStorageBackend } from './storage';

export function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function slugToFilename(slug: string): string {
  return `${slug}.md`;
}

export async function readNote(slug: string): Promise<Note> {
  const backend = await getStorageBackend();
  return backend.readNote(slug);
}

export async function writeNote(
  slug: string,
  content: string,
  frontmatter: Partial<NoteFrontmatter> & { title: string }
): Promise<Note> {
  const backend = await getStorageBackend();
  return backend.writeNote(slug, content, frontmatter);
}

export async function deleteNote(slug: string): Promise<void> {
  const backend = await getStorageBackend();
  return backend.deleteNote(slug);
}

export async function listNotes(): Promise<NoteSummary[]> {
  const backend = await getStorageBackend();
  return backend.listNotes();
}

export async function readDailyNote(date: string): Promise<Note | null> {
  const backend = await getStorageBackend();
  return backend.readDailyNote(date);
}

export async function writeDailyNote(date: string, content: string): Promise<Note> {
  const backend = await getStorageBackend();
  return backend.writeDailyNote(date, content);
}

export async function listDailyNotes(): Promise<DailyNoteSummary[]> {
  const backend = await getStorageBackend();
  return backend.listDailyNotes();
}

export async function readAllNotes(): Promise<Note[]> {
  const backend = await getStorageBackend();
  return backend.readAllNotes();
}
