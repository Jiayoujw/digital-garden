'use client';

import { useState, useEffect, useRef, useCallback, isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import Link from 'next/link';
import type { ReactElement } from 'react';

interface NotePreviewProps {
  content: string;
  validSlugs?: Set<string>;
}

function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const idRef = useRef(`m-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    let cancelled = false;
    import('mermaid').then((mod) => {
      if (cancelled || !ref.current) return;
      mod.default.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeCSS: '.label foreignObject { overflow: visible; }',
      });
      mod.default
        .render(idRef.current, chart)
        .then(({ svg }) => {
          if (ref.current && !cancelled) {
            ref.current.innerHTML = svg;
          }
        })
        .catch(() => {
          if (ref.current && !cancelled) {
            ref.current.innerHTML =
              '<pre class="mermaid-error">Mermaid render error</pre>';
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <div
      ref={ref}
      className="mermaid-container my-4 flex justify-center overflow-x-auto"
      data-mermaid-chart={chart}
    />
  );
}

export function NotePreview({ content, validSlugs }: NotePreviewProps) {
  const [slugs, setSlugs] = useState<Set<string>>(validSlugs ?? new Set());

  useEffect(() => {
    if (validSlugs) {
      setSlugs(validSlugs);
      return;
    }
    fetch('/api/notes')
      .then((r) => r.json())
      .then((notes: { slug: string }[]) => {
        setSlugs(new Set(notes.map((n) => n.slug)));
      })
      .catch(() => {});
  }, [validSlugs, content]);

  const renderPre = useCallback(
    (props: { children?: React.ReactNode }) => {
      const child = props.children;
      if (isValidElement(child)) {
        const el = child as ReactElement<{ className?: string; children?: React.ReactNode }>;
        const className = el.props.className || '';
        if (className.includes('language-mermaid')) {
          const chartCode = String(el.props.children ?? '').trim();
          return <MermaidDiagram chart={chartCode} />;
        }
      }
      return <pre {...props} />;
    },
    []
  );

  const slugifyHeading = (text: string) =>
    text.toLowerCase().replace(/[^\w一-鿿]+/g, '-').replace(/^-|-$/g, '');

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={{
          pre: renderPre,
          h1: ({ children, ...props }) => {
            const id = slugifyHeading(String(children));
            return <h1 id={id} {...props}>{children}</h1>;
          },
          h2: ({ children, ...props }) => {
            const id = slugifyHeading(String(children));
            return <h2 id={id} {...props}>{children}</h2>;
          },
          h3: ({ children, ...props }) => {
            const id = slugifyHeading(String(children));
            return <h3 id={id} {...props}>{children}</h3>;
          },
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
