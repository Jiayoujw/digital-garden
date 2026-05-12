'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

interface NotePreviewProps {
  content: string;
  validSlugs?: Set<string>;
}

export function NotePreview({ content, validSlugs }: NotePreviewProps) {
  const [slugs, setSlugs] = useState<Set<string>>(validSlugs ?? new Set());

  useEffect(() => {
    if (validSlugs) {
      setSlugs(validSlugs);
      return;
    }
    // Fetch all valid slugs if not provided
    fetch('/api/notes')
      .then((r) => r.json())
      .then((notes: { slug: string }[]) => {
        setSlugs(new Set(notes.map((n) => n.slug)));
      })
      .catch(() => {});
  }, [validSlugs, content]);

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children, ...props }) {
            if (!href) return <a {...props}>{children}</a>;
            const isWikilink = href.startsWith('/note/') || !href.startsWith('http');
            if (isWikilink) {
              const slug = href.startsWith('/note/') ? href.replace('/note/', '') : href;
              const exists = slugs.size === 0 || slugs.has(slug);
              return (
                <Link
                  href={`/note/${slug}`}
                  className={exists ? 'wikilink' : 'wikilink wikilink-missing'}
                >
                  {children}
                </Link>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
