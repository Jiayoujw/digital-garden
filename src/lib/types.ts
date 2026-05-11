export interface NoteFrontmatter {
  title: string;
  tags: string[];
  created: string;
  updated: string;
}

export interface Note {
  slug: string;
  path: string;
  frontmatter: NoteFrontmatter;
  content: string;
  rawContent: string;
}

export interface NoteSummary {
  slug: string;
  title: string;
  tags: string[];
  updated: string;
}

export interface Wikilink {
  target: string;
  alias: string | null;
}

export interface GraphNode {
  id: string;
  name: string;
  val: number;
  color?: string;
  group?: string;
  tags: string[];
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface Cluster {
  id: string;
  label: string;
  color: string;
  noteSlugs: string[];
  noteCount: number;
}

export interface DailyNoteSummary {
  date: string;
  title: string;
}

export interface LinkInfo {
  forward: NoteSummary[];
  back: NoteSummary[];
}
