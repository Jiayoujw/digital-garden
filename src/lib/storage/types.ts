import type { Note, NoteFrontmatter, NoteSummary, DailyNoteSummary } from '@/lib/types';

export interface StorageBackend {
  readNote(slug: string): Promise<Note>;
  writeNote(slug: string, content: string, frontmatter: Partial<NoteFrontmatter> & { title: string }): Promise<Note>;
  deleteNote(slug: string): Promise<void>;
  listNotes(): Promise<NoteSummary[]>;
  readDailyNote(date: string): Promise<Note | null>;
  writeDailyNote(date: string, content: string): Promise<Note>;
  listDailyNotes(): Promise<DailyNoteSummary[]>;
  readAllNotes(): Promise<Note[]>;
  ensureDirectories(): Promise<void>;
}
