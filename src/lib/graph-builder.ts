import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { extractWikilinks } from './wikilink-parser';
import type { GraphData, GraphNode, GraphLink, NoteSummary } from './types';

const NOTES_DIR = path.join(process.cwd(), 'data', 'notes');

export async function buildGraphIndex(): Promise<GraphData> {
  await fs.mkdir(NOTES_DIR, { recursive: true });
  const files = await fs.readdir(NOTES_DIR);
  const mdFiles = files.filter((f) => f.endsWith('.md'));

  const nodes: GraphNode[] = [];
  const linkMap = new Map<string, Set<string>>();

  for (const file of mdFiles) {
    const raw = await fs.readFile(path.join(NOTES_DIR, file), 'utf-8');
    const parsed = matter(raw);
    const slug = file.replace(/\.md$/, '');
    const wikilinks = extractWikilinks(parsed.content);

    nodes.push({
      id: slug,
      name: parsed.data.title ?? slug,
      val: 1,
      tags: parsed.data.tags ?? [],
    });

    linkMap.set(slug, new Set(wikilinks.map((l) => l.target)));
  }

  const validSlugs = new Set(nodes.map((n) => n.id));
  const linkCount = new Map<string, number>();
  const links: GraphLink[] = [];

  for (const [source, targets] of linkMap) {
    for (const target of targets) {
      if (validSlugs.has(target) && source !== target) {
        const key = [source, target].sort().join('::');
        const count = (linkCount.get(key) ?? 0) + 1;
        linkCount.set(key, count);
        if (count === 1) {
          links.push({ source, target, value: 1 });
        }
      }
    }
  }

  const degree = new Map<string, number>();
  for (const l of links) {
    degree.set(l.source, (degree.get(l.source) ?? 0) + 1);
    degree.set(l.target, (degree.get(l.target) ?? 0) + 1);
  }
  for (const node of nodes) {
    node.val = Math.max(degree.get(node.id) ?? 1, 1);
  }

  return { nodes, links };
}

export async function getBacklinks(slug: string): Promise<NoteSummary[]> {
  const graphData = await buildGraphIndex();
  const backlinks = graphData.links
    .filter((l) => l.target === slug)
    .map((l) => l.source);
  const uniqueSources = [...new Set(backlinks)];
  return uniqueSources
    .map((s) => {
      const node = graphData.nodes.find((n) => n.id === s);
      return node
        ? { slug: node.id, title: node.name, tags: node.tags, updated: '' }
        : null;
    })
    .filter(Boolean) as NoteSummary[];
}
