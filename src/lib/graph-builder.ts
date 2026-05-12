import { extractWikilinks } from './wikilink-parser';
import type { GraphData, GraphNode, GraphLink, NoteSummary } from './types';
import { listNotes, readNote } from './fs-utils';
import type { Note } from './types';

function computePageRank(nodes: GraphNode[], links: GraphLink[], damping = 0.85, iterations = 30): Map<string, number> {
  const nodeIds = nodes.map((n) => n.id);
  const N = nodeIds.length;
  if (N === 0) return new Map();

  const outLinks = new Map<string, string[]>();
  const inLinks = new Map<string, string[]>();
  for (const id of nodeIds) {
    outLinks.set(id, []);
    inLinks.set(id, []);
  }
  for (const l of links) {
    outLinks.get(l.source)?.push(l.target);
    inLinks.get(l.target)?.push(l.source);
  }

  const rank = new Map<string, number>();
  for (const id of nodeIds) rank.set(id, 1 / N);

  for (let iter = 0; iter < iterations; iter++) {
    const newRank = new Map<string, number>();
    for (const id of nodeIds) {
      const inNeighbors = inLinks.get(id) ?? [];
      let sum = 0;
      for (const neighbor of inNeighbors) {
        const outDegree = outLinks.get(neighbor)?.length ?? 1;
        sum += (rank.get(neighbor) ?? 0) / outDegree;
      }
      newRank.set(id, (1 - damping) / N + damping * sum);
    }
    for (const [k, v] of newRank) rank.set(k, v);
  }

  return rank;
}

export async function buildGraphIndex(): Promise<GraphData> {
  const noteSummaries = await listNotes();
  const nodes: GraphNode[] = [];
  const linkMap = new Map<string, Set<string>>();

  for (const s of noteSummaries) {
    let note: Note;
    try {
      note = await readNote(s.slug);
    } catch {
      continue;
    }

    const wikilinks = extractWikilinks(note.content);

    nodes.push({
      id: note.slug,
      name: note.frontmatter.title,
      val: 1,
      tags: note.frontmatter.tags,
    });

    linkMap.set(note.slug, new Set(wikilinks.map((l) => l.target)));
  }

  const validSlugs = new Set(nodes.map((n) => n.id));
  const ghostSlugs = new Set<string>();
  const linkCount = new Map<string, number>();
  const links: GraphLink[] = [];

  for (const [source, targets] of linkMap) {
    for (const target of targets) {
      if (source === target) continue;
      const key = [source, target].sort().join('::');
      const count = (linkCount.get(key) ?? 0) + 1;
      linkCount.set(key, count);
      if (count === 1) {
        if (validSlugs.has(target)) {
          links.push({ source, target, value: 1 });
        } else {
          ghostSlugs.add(target);
          links.push({ source, target, value: 0.5, ghost: true });
        }
      }
    }
  }

  // Add ghost nodes for unresolved wikilinks
  for (const ghostSlug of ghostSlugs) {
    if (!validSlugs.has(ghostSlug)) {
      nodes.push({
        id: ghostSlug,
        name: ghostSlug,
        val: 0.5,
        tags: [],
        ghost: true,
      });
    }
  }

  // Compute PageRank for sizing (only for real nodes)
  const realNodes = nodes.filter((n) => !n.ghost);
  const realLinks = links.filter((l) => !l.ghost);
  const pageRank = computePageRank(realNodes, realLinks);
  const maxPR = Math.max(...pageRank.values(), 0.001);

  for (const node of nodes) {
    if (node.ghost) {
      node.val = 0.5;
    } else {
      const pr = pageRank.get(node.id) ?? (1 / realNodes.length);
      node.val = 1 + (pr / maxPR) * 19; // Scale to 1-20
    }
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
