import { NextRequest, NextResponse } from 'next/server';
import { getStorageBackend } from '@/lib/storage';

interface CommitEntry {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    return NextResponse.json(
      { error: 'Version history requires GitHub backend' },
      { status: 503 }
    );
  }

  try {
    const filePath = `data/notes/${slug}.md`;
    const url = `https://api.github.com/repos/${repo}/commits?path=${filePath}&per_page=30`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'digital-garden',
      },
    });

    if (!res.ok) {
      if (res.status === 404 || res.status === 409) {
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { error: `GitHub API error: ${res.status}` },
        { status: 502 }
      );
    }

    const commits = (await res.json()) as Array<{
      sha: string;
      commit: { message: string; author: { name: string; date: string } };
    }>;

    const history: CommitEntry[] = commits.map((c) => ({
      sha: c.sha.slice(0, 7),
      message: c.commit.message,
      date: c.commit.author.date,
      author: c.commit.author.name,
    }));

    return NextResponse.json(history);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 502 });
  }
}
