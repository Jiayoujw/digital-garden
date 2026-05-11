import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import type { Note, NoteFrontmatter, NoteSummary } from './types';
import { NOTES_DIR, DAILY_DIR, ensureDirectories } from './data-dir';

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
  await ensureDirectories();
  const filePath = path.join(NOTES_DIR, slugToFilename(slug));
  const rawContent = await fs.readFile(filePath, 'utf-8');
  const parsed = matter(rawContent);
  const frontmatter: NoteFrontmatter = {
    title: parsed.data.title ?? slug,
    tags: parsed.data.tags ?? [],
    created: parsed.data.created ?? new Date().toISOString(),
    updated: parsed.data.updated ?? new Date().toISOString(),
  };
  return {
    slug,
    path: filePath,
    frontmatter,
    content: parsed.content,
    rawContent,
  };
}

export async function writeNote(
  slug: string,
  content: string,
  frontmatter: Partial<NoteFrontmatter> & { title: string }
): Promise<Note> {
  await ensureDirectories();
  const existing = await readNoteSafely(slug);
  const fm: NoteFrontmatter = {
    title: frontmatter.title,
    tags: frontmatter.tags ?? [],
    created: frontmatter.created ?? existing?.frontmatter.created ?? new Date().toISOString(),
    updated: new Date().toISOString(),
  };
  const rawContent = matter.stringify(content, fm);
  const filePath = path.join(NOTES_DIR, slugToFilename(slug));
  await fs.writeFile(filePath, rawContent, 'utf-8');
  return { slug, path: filePath, frontmatter: fm, content, rawContent };
}

async function readNoteSafely(slug: string): Promise<Note | null> {
  try {
    return await readNote(slug);
  } catch {
    return null;
  }
}

export async function deleteNote(slug: string): Promise<void> {
  await ensureDirectories();
  const filePath = path.join(NOTES_DIR, slugToFilename(slug));
  await fs.unlink(filePath);
}

export async function listNotes(): Promise<NoteSummary[]> {
  await ensureDirectories();
  const files = await fs.readdir(NOTES_DIR);
  const mdFiles = files.filter((f) => f.endsWith('.md'));
  const notes: NoteSummary[] = [];
  for (const file of mdFiles) {
    const slug = file.replace(/\.md$/, '');
    const note = await readNoteSafely(slug);
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

export async function readDailyNote(date: string): Promise<Note | null> {
  await ensureDirectories();
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

export async function writeDailyNote(date: string, content: string): Promise<Note> {
  await ensureDirectories();
  const fm = {
    title: date,
    tags: [] as string[],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
  const rawContent = matter.stringify(content, fm);
  const filePath = path.join(DAILY_DIR, `${date}.md`);
  await fs.writeFile(filePath, rawContent, 'utf-8');
  return { slug: date, path: filePath, frontmatter: fm, content, rawContent };
}

export async function listDailyNotes(): Promise<{ date: string; title: string }[]> {
  await ensureDirectories();
  const files = await fs.readdir(DAILY_DIR);
  const dailyFiles = files.filter((f) => f.endsWith('.md'));
  return dailyFiles
    .map((f) => ({
      date: f.replace(/\.md$/, ''),
      title: f.replace(/\.md$/, ''),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
