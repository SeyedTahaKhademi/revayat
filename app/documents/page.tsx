'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import DocumentTile from '@/components/DocumentTile';
import documentData from '@/data/documents.json';
import type { DocumentTileSize } from '@/data/documents';

const categories = Array.from(new Set(documentData.map((i) => i.category)));
const filterTags = ['همه', ...categories];

function DocumentsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const DEFAULT_CATEGORY = 'همه';
  const [activeFilter, setActiveFilter] = useState(DEFAULT_CATEGORY);

  useEffect(() => {
    if (categoryParam && filterTags.includes(categoryParam)) {
      setActiveFilter(categoryParam);
    } else {
      setActiveFilter(DEFAULT_CATEGORY);
    }
  }, [categoryParam]);

  const filteredData = activeFilter === 'همه'
    ? documentData
    : documentData.filter((item) => item.category === activeFilter);

  const title = 'روایت‌های تصویری';
  const subtitle = 'گزیده‌ای از گزارش‌ها و تصاویر میدانی از جنگ ۱۲ روزه';

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900">{title}</h1>
              <p className="mt-2 text-gray-600">{subtitle}</p>
            </div>
            <div className="hidden md:block rounded-full border-2 border-rose-500 px-6 py-2">
              <span className="text-sm font-semibold text-rose-600">مستندات</span>
            </div>
          </div>
        </header>

        {/* Filter Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                tag === activeFilter
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[240px]">
          {filteredData.map((item, index) => {
            const allowedSizes: DocumentTileSize[] = ['normal', 'wide', 'tall', 'hero'];
            const size = item.size && allowedSizes.includes(item.size as DocumentTileSize)
              ? (item.size as DocumentTileSize)
              : 'normal';
            
            // Create masonry effect with different sizes
            let colSpan = 'col-span-1';
            let rowSpan = 'row-span-1';
            
            if (size === 'hero') {
              colSpan = 'md:col-span-2 lg:col-span-2';
              rowSpan = 'md:row-span-2 lg:row-span-2';
            } else if (size === 'wide') {
              colSpan = 'md:col-span-2 lg:col-span-2';
            } else if (size === 'tall') {
              rowSpan = 'md:row-span-2 lg:row-span-2';
            }
            
            return (
              <div key={item.slug} className={`${colSpan} ${rowSpan} h-full`}>
                <DocumentTile
                  title={item.title}
                  category={item.category}
                  image={item.image}
                  size={size}
                  href={`/documents/${item.slug}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

export default function DocumentsExplorePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">بارگذاری...</div>}>
      <DocumentsContent />
    </Suspense>
  );
}
