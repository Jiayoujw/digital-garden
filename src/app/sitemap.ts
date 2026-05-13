import type { MetadataRoute } from 'next';
import { listNotes } from '@/lib/fs-utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://notes.jiayouvibe.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/graph`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/clusters`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/tags`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/timeline`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/daily`, changeFrequency: 'daily', priority: 0.6 },
  ];

  let notePages: MetadataRoute.Sitemap = [];
  try {
    const notes = await listNotes();
    notePages = notes.map((note) => ({
      url: `${baseUrl}/note/${note.slug}`,
      lastModified: note.updated ? new Date(note.updated) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));
  } catch {
    // File system backend may fail in build
  }

  return [...staticPages, ...notePages];
}
