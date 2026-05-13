'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ExportButtonProps {
  title: string;
  content: string;
  slug: string;
}

export function ExportButton({ title, content, slug }: ExportButtonProps) {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);

  const downloadMd = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const printPdf = () => {
    window.print();
    setOpen(false);
  };

  return (
    <div className="relative inline-flex">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 rounded-lg text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
        title={locale === 'zh' ? '导出' : 'Export'}
      >
        ⬇ {locale === 'zh' ? '导出' : 'Export'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-1.5 shadow-xl z-20 min-w-[160px]">
            <button
              onClick={downloadMd}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center gap-2"
            >
              <span>📥</span>
              {locale === 'zh' ? '下载 Markdown' : 'Download Markdown'}
            </button>
            <button
              onClick={printPdf}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center gap-2"
            >
              <span>🖨️</span>
              {locale === 'zh' ? '打印为 PDF' : 'Print to PDF'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
