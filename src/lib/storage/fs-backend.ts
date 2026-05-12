import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import type { Note, NoteFrontmatter, NoteSummary, DailyNoteSummary } from '@/lib/types';
import type { StorageBackend } from './types';

const isVercel = process.env.VERCEL === '1';

const NOTES_DIR = isVercel
  ? '/tmp/data/notes'
  : path.join(process.cwd(), 'data', 'notes');

const DAILY_DIR = isVercel
  ? '/tmp/data/daily'
  : path.join(process.cwd(), 'data', 'daily');

const SEED_NOTES_DIR = path.join(process.cwd(), 'data', 'notes');
const SEED_DAILY_DIR = path.join(process.cwd(), 'data', 'daily');

let initialized = false;

export class FsStorageBackend implements StorageBackend {
  constructor() { /* no config needed */ }

  async ensureDirectories(): Promise<void> {
    await fs.mkdir(NOTES_DIR, { recursive: true });
    await fs.mkdir(DAILY_DIR, { recursive: true });

    if (isVercel && !initialized) {
      initialized = true;
      try {
        const noteFiles = await fs.readdir(SEED_NOTES_DIR);
        for (const file of noteFiles) {
          if (file.endsWith('.md')) {
            const src = path.join(SEED_NOTES_DIR, file);
            const dest = path.join(NOTES_DIR, file);
            try {
              await fs.access(dest);
            } catch {
              await fs.copyFile(src, dest);
            }
          }
        }
      } catch { /* seed notes dir may not exist */ }

      try {
        const dailyFiles = await fs.readdir(SEED_DAILY_DIR);
        for (const file of dailyFiles) {
          if (file.endsWith('.md')) {
            const src = path.join(SEED_DAILY_DIR, file);
            const dest = path.join(DAILY_DIR, file);
            try {
              await fs.access(dest);
            } catch {
              await fs.copyFile(src, dest);
            }
          }
        }
      } catch { /* seed daily dir may not exist */ }
    }
  }

  async readNote(slug: string): Promise<Note> {
    await this.ensureDirectories();
    const filePath = path.join(NOTES_DIR, `${slug}.md`);
    const rawContent = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(rawContent);
    const frontmatter: NoteFrontmatter = {
      title: parsed.data.title ?? slug,
      tags: parsed.data.tags ?? [],
      created: parsed.data.created ?? new Date().toISOString(),
      updated: parsed.data.updated ?? new Date().toISOString(),
    };
    return { slug, path: filePath, frontmatter, content: parsed.content, rawContent };
  }

  async writeNote(slug: string, content: string, frontmatter: Partial<NoteFrontmatter> & { title: string }): Promise<Note> {
    await this.ensureDirectories();
    const existing = await this.readNoteSafely(slug);
    const fm: NoteFrontmatter = {
      title: frontmatter.title,
      tags: frontmatter.tags ?? [],
      created: frontmatter.created ?? existing?.frontmatter.created ?? new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    const rawContent = matter.stringify(content, fm);
    const filePath = path.join(NOTES_DIR, `${slug}.md`);
    await fs.writeFile(filePath, rawContent, 'utf-8');
    return { slug, path: filePath, frontmatter: fm, content, rawContent };
  }

  async deleteNote(slug: string): Promise<void> {
    await this.ensureDirectories();
    const filePath = path.join(NOTES_DIR, `${slug}.md`);
    await fs.unlink(filePath);
  }

  async listNotes(): Promise<NoteSummary[]> {
    await this.ensureDirectories();
    const files = await fs.readdir(NOTES_DIR);
    const mdFiles = files.filter((f) => f.endsWith('.md'));
    const notes: NoteSummary[] = [];
    for (const file of mdFiles) {
      const slug = file.replace(/\.md$/, '');
      const note = await this.readNoteSafely(slug);
      if (note) {
        notes.push({
          slug: note.slug,
          title: note.frontmatter.title,
          tags: note.frontmatter.tags,
          updated: note.frontmatter.updated,
        });
      }
    }
    notes.sort((a, b) => b.updated.localeCompare(a.updated));
    return notes;
  }

  async readDailyNote(date: string): Promise<Note | null> {
    await this.ensureDirectories();
    const filePath = path.join(DAILY_DIR, `${date}.md`);
    try {
      const rawContent = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(rawContent);
      return {
        slug: date,
        path: filePath,
        frontmatter: {
          title: parsed.data.title ?? date,
          tags: parsed.data.tags ?? [],
          created: parsed.data.created ?? new Date().toISOString(),
          updated: parsed.data.updated ?? new Date().toISOString(),
        },
        content: parsed.content,
        rawContent,
      };
    } catch {
      return null;
    }
  }

  async writeDailyNote(date: string, content: string): Promise<Note> {
    await this.ensureDirectories();
    const fm = { title: date, tags: [] as string[], created: new Date().toISOString(), updated: new Date().toISOString() };
    const rawContent = matter.stringify(content, fm);
    const filePath = path.join(DAILY_DIR, `${date}.md`);
    await fs.writeFile(filePath, rawContent, 'utf-8');
    return { slug: date, path: filePath, frontmatter: fm, content, rawContent };
  }

  async listDailyNotes(): Promise<DailyNoteSummary[]> {
    await this.ensureDirectories();
    const files = await fs.readdir(DAILY_DIR);
    const dailyFiles = files.filter((f) => f.endsWith('.md'));
    return dailyFiles
      .map((f) => ({ date: f.replace(/\.md$/, ''), title: f.replace(/\.md$/, '') }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async readAllNotes(): Promise<Note[]> {
    await this.ensureDirectories();
    const files = await fs.readdir(NOTES_DIR);
    const mdFiles = files.filter((f) => f.endsWith('.md'));
    const notes: Note[] = [];
    for (const file of mdFiles) {
      const rawContent = await fs.readFile(path.join(NOTES_DIR, file), 'utf-8');
      const parsed = matter(rawContent);
      const slug = file.replace(/\.md$/, '');
      notes.push({
        slug,
        path: file,
        frontmatter: {
          title: parsed.data.title ?? slug,
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

  private async readNoteSafely(slug: string): Promise<Note | null> {
    try { return await this.readNote(slug); } catch { return null; }
  }
}
