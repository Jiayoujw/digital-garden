'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

interface NotePreviewProps {
  content: string;
}

export function NotePreview({ content }: NotePreviewProps) {
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
              return (
                <Link href={`/note/${slug}`} className="wikilink">
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
