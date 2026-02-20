'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Markdownからh2のみ抽出
    const headingRegex = /^(#{2})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s\u3000-\u9fff]/g, '')
        .replace(/\s+/g, '-');

      items.push({ id, text, level });
    }

    setToc(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    // h2のみ監視
    const headings = document.querySelectorAll('article h2');
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav className="bg-gray-50 rounded-lg p-5 mb-10">
      <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        目次
      </h2>
      <ol className="space-y-1 text-sm">
        {(() => {
          let h2Index = 0;
          return toc.map((item, index) => {
            if (item.level === 2) {
              h2Index++;
            }
            const displayNumber = item.level === 2 ? `${h2Index}. ` : '';
            return (
              <li
                key={index}
                className={item.level === 3 ? 'ml-4' : ''}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`block py-1 transition-colors hover:text-primary-600 ${
                    activeId === item.id
                      ? 'text-primary-600 font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  {displayNumber}{item.text}
                </a>
              </li>
            );
          });
        })()}
      </ol>
    </nav>
  );
}
