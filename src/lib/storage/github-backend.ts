import matter from 'gray-matter';
import type { Note, NoteFrontmatter, NoteSummary, DailyNoteSummary } from '@/lib/types';
import type { StorageBackend } from './types';

interface CacheEntry<T> {
  data: T;
  ts: number;
}

export class GitHubStorageBackend implements StorageBackend {
  private baseUrl: string;
  private headers: Record<string, string>;
  private branch: string;
  private cache: Map<string, CacheEntry<unknown>>;
  private dirCacheTTL: number;
  private fileCacheTTL: number;

  constructor(token: string, repo: string, branch: string) {
    this.branch = branch;
    this.baseUrl = `https://api.github.com/repos/${repo}/contents`;
    this.headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'digital-garden',
    };
    this.cache = new Map();
    this.dirCacheTTL = 60_000;
    this.fileCacheTTL = 30_000;
  }

  async ensureDirectories(): Promise<void> {
    // GitHub repos already have the directory structure committed.
    // Verify the notes path is accessible.
    try {
      await this.apiGet('/data/notes');
    } catch {
      // Path doesn't exist yet — first note write will create it
    }
  }

  // --- Notes ---

  async readNote(slug: string): Promise<Note> {
    const file = await this.apiGet(`/data/notes/${slug}.md`);
    const rawContent = Buffer.from(file.content, 'base64').toString('utf-8');
    const parsed = matter(rawContent);
    const frontmatter: NoteFrontmatter = {
      title: parsed.data.title ?? slug,
      tags: parsed.data.tags ?? [],
      created: parsed.data.created ?? new Date().toISOString(),
      updated: parsed.data.updated ?? new Date().toISOString(),
    };
    return { slug, path: file.path, frontmatter, content: parsed.content, rawContent };
  }

  async writeNote(
    slug: string,
    content: string,
    frontmatter: Partial<NoteFrontmatter> & { title: string }
  ): Promise<Note> {
    const fm: NoteFrontmatter = {
      title: frontmatter.title,
      tags: frontmatter.tags ?? [],
      created: frontmatter.created ?? new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    const rawContent = matter.stringify(content, fm);
    const encoded = Buffer.from(rawContent, 'utf-8').toString('base64');
    const filePath = `data/notes/${slug}.md`;

    let sha: string | undefined;
    try {
      const existing = await this.apiGet(`/${filePath}`);
      sha = existing.sha;
      // Preserve original created date
      const parsed = matter(Buffer.from(existing.content, 'base64').toString('utf-8'));
      if (parsed.data.created) fm.created = parsed.data.created;
    } catch (e: unknown) {
      if (!isNotFound(e)) throw e;
    }

    const body: Record<string, string> = {
      message: sha ? `Update note: ${fm.title}` : `Create note: ${fm.title}`,
      content: encoded,
      branch: this.branch,
    };
    if (sha) body.sha = sha;

    await this.apiPut(`/${filePath}`, body);
    this.invalidateCache(`/data/notes/${slug}.md`);
    this.invalidateCache('/data/notes');

    return { slug, path: filePath, frontmatter: fm, content, rawContent };
  }

  async deleteNote(slug: string): Promise<void> {
    const filePath = `data/notes/${slug}.md`;
    const existing = await this.apiGet(`/${filePath}`);
    await this.apiDelete(`/${filePath}`, existing.sha);
    this.invalidateCache(`/data/notes/${slug}.md`);
    this.invalidateCache('/data/notes');
  }

  async listNotes(): Promise<NoteSummary[]> {
    let files: GitHubFile[];
    try {
      files = await this.apiGet('/data/notes');
    } catch (e: unknown) {
      if (isNotFound(e)) return [];
      throw e;
    }

    const mdFiles = files.filter((f) => f.name.endsWith('.md'));
    const notes: NoteSummary[] = [];

    // Fetch titles in parallel with concurrency limit
    const limit = 5;
    for (let i = 0; i < mdFiles.length; i += limit) {
      const batch = mdFiles.slice(i, i + limit);
      const results = await Promise.allSettled(
        batch.map(async (f) => {
          const file = await this.apiGet(`/data/notes/${f.name}`);
          const rawContent = Buffer.from(file.content, 'base64').toString('utf-8');
          const parsed = matter(rawContent);
          return {
            slug: f.name.replace(/\.md$/, ''),
            title: parsed.data.title ?? f.name.replace(/\.md$/, ''),
            tags: parsed.data.tags ?? [],
            updated: parsed.data.updated ?? '',
          };
        })
      );
      for (const r of results) {
        if (r.status === 'fulfilled') notes.push(r.value);
      }
    }

    notes.sort((a, b) => b.updated.localeCompare(a.updated));
    return notes;
  }

  // --- Daily Notes ---

  async readDailyNote(date: string): Promise<Note | null> {
    try {
      const file = await this.apiGet(`/data/daily/${date}.md`);
      const rawContent = Buffer.from(file.content, 'base64').toString('utf-8');
      const parsed = matter(rawContent);
      return {
        slug: date,
        path: file.path,
        frontmatter: {
          title: parsed.data.title ?? date,
          tags: parsed.data.tags ?? [],
          created: parsed.data.created ?? new Date().toISOString(),
          updated: parsed.data.updated ?? new Date().toISOString(),
        },
        content: parsed.content,
        rawContent,
      };
    } catch (e: unknown) {
      if (isNotFound(e)) return null;
      throw e;
    }
  }

  async writeDailyNote(date: string, content: string): Promise<Note> {
    const fm = {
      title: date,
      tags: [] as string[],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    const rawContent = matter.stringify(content, fm);
    const encoded = Buffer.from(rawContent, 'utf-8').toString('base64');
    const filePath = `data/daily/${date}.md`;

    let sha: string | undefined;
    try {
      const existing = await this.apiGet(`/${filePath}`);
      sha = existing.sha;
    } catch (e: unknown) {
      if (!isNotFound(e)) throw e;
    }

    const body: Record<string, string> = {
      message: `Update daily note: ${date}`,
      content: encoded,
      branch: this.branch,
    };
    if (sha) body.sha = sha;

    await this.apiPut(`/${filePath}`, body);
    this.invalidateCache(`/data/daily/${date}.md`);
    this.invalidateCache('/data/daily');

    return { slug: date, path: filePath, frontmatter: fm, content, rawContent };
  }

  async listDailyNotes(): Promise<DailyNoteSummary[]> {
    let files: GitHubFile[];
    try {
      files = await this.apiGet('/data/daily');
    } catch (e: unknown) {
      if (isNotFound(e)) return [];
      throw e;
    }

    return files
      .filter((f) => f.name.endsWith('.md'))
      .map((f) => ({
        date: f.name.replace(/\.md$/, ''),
        title: f.name.replace(/\.md$/, ''),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  // --- Bulk operations ---

  async readAllNotes(): Promise<Note[]> {
    const summaries = await this.listNotes();
    const notes: Note[] = [];
    const limit = 5;
    for (let i = 0; i < summaries.length; i += limit) {
      const batch = summaries.slice(i, i + limit);
      const results = await Promise.allSettled(
        batch.map((s) => this.readNote(s.slug))
      );
      for (const r of results) {
        if (r.status === 'fulfilled') notes.push(r.value);
      }
    }
    return notes;
  }

  // --- GitHub API helpers ---

  private async apiGet(path: string): Promise<any> {
    const cached = this.cache.get(path);
    const ttl = path.endsWith('.md') ? this.fileCacheTTL : this.dirCacheTTL;
    if (cached && Date.now() - cached.ts < ttl) {
      return cached.data;
    }

    let lastErr: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await this.sleep(Math.pow(2, attempt) * 200);
      try {
        const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers });
        if (res.status === 404) throw Object.assign(new Error('Not found'), { status: 404 });
        if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        const data = await res.json();
        this.cache.set(path, { data, ts: Date.now() });
        return data;
      } catch (e: unknown) {
        if (isNotFound(e)) throw e;
        lastErr = e instanceof Error ? e : new Error(String(e));
      }
    }
    throw lastErr ?? new Error('GitHub API request failed');
  }

  private async apiPut(path: string, body: Record<string, string>): Promise<void> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.status === 409) {
      // SHA conflict — retry once with fresh SHA
      const existing = await this.apiGetFresh(path);
      body.sha = (existing as GitHubFile).sha;
      const retryRes = await fetch(`${this.baseUrl}${path}`, {
        method: 'PUT',
        headers: { ...this.headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!retryRes.ok) throw new Error(`GitHub API error: ${retryRes.status}`);
    } else if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }
  }

  private async apiDelete(path: string, sha: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Delete: ${path}`, sha, branch: 'main' }),
    });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  private async apiGetFresh(path: string): Promise<GitHubFile> {
    this.cache.delete(path);
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    return res.json();
  }

  private invalidateCache(path: string): void {
    this.cache.delete(path);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  content: string;
  encoding: string;
}

function isNotFound(e: unknown): boolean {
  return e instanceof Error && 'status' in e && (e as Error & { status: number }).status === 404;
}
