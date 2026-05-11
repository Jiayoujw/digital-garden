import Link from 'next/link';

interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/search?q=%23${encodeURIComponent(tag)}`}
          className="px-2 py-0.5 rounded-md text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}
