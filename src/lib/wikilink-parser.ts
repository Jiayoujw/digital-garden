import type { Wikilink } from './types';

export function extractWikilinks(markdown: string): Wikilink[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '');
  const regex = /\[\[([^\]|#]+)(?:[|#]([^\]]+))?\]\]/g;
  const results: Wikilink[] = [];
  let match;
  while ((match = regex.exec(withoutCode)) !== null) {
    results.push({
      target: match[1].trim().toLowerCase().replace(/\s+/g, '-'),
      alias: match[2]?.trim() ?? null,
    });
  }
  const seen = new Map<string, Wikilink>();
  for (const r of results) {
    if (!seen.has(r.target)) seen.set(r.target, r);
  }
  return [...seen.values()];
}
