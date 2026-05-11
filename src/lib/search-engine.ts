import Fuse from 'fuse.js';
import type { Note } from './types';

let fuse: Fuse<Note> | null = null;

export function createSearchEngine(notes: Note[]): Fuse<Note> {
  fuse = new Fuse(notes, {
    keys: [
      { name: 'frontmatter.title', weight: 3 },
      { name: 'content', weight: 1 },
      { name: 'frontmatter.tags', weight: 2 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  });
  return fuse;
}

export function search(query: string, notes?: Note[]) {
  if (notes) createSearchEngine(notes);
  if (!fuse) return [];
  return fuse.search(query);
}
