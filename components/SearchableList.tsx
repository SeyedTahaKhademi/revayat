"use client";

import StoryCard from '@/components/StoryCard';
import { useMemo, useState } from 'react';

type Item = {
  slug: string;
  title: string;
  description?: string;
  image: string;
  tag?: string;
  content?: string[];
};

interface Props {
  items: Item[];
  linkBase?: string;
  showSummary?: boolean;
}

export default function SearchableList({ items, linkBase, showSummary }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((story) => {
      const hay = [
        story.title,
        story.description || '',
        ...(Array.isArray(story.content) ? story.content : []),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  return (
    <div className="space-y-5">
      <div className="max-w-xl mx-auto w-full px-2 sm:px-0">
        <div className="relative">
          <input
            type="search"
            aria-label="جستجو"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو..."
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-3 pl-9 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 text-sm"
          />
          <svg
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <p className="mt-1 text-[11px] text-gray-500 text-center">{filtered.length} نتیجه</p>
      </div>

      {filtered.map((story) => (
        <StoryCard
          key={story.slug}
          title={story.title}
          description={story.description}
          image={story.image}
          tag={story.tag}
          href={linkBase ? `${linkBase}/${story.slug}` : undefined}
          summary={showSummary && story.content && story.content[0] ? story.content[0] : undefined}
        />
      ))}
    </div>
  );
}
