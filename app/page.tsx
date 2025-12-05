// src/app/page.tsx (نسخه بازطراحی‌شده)

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import CategoryCard from '@/components/categuryCard';
import carouselData from '@/data/carousel.json';
import narratives from '@/data/narratives.json';
import solidarity from '@/data/solidarity_narratives.json';
import martyrs from '@/data/nuclear_martyrs.json';
import { useExplore } from '@/components/ExploreContext';
import { useSave } from '@/components/SaveContext';
import { Bookmark } from 'lucide-react';

const normalizeImageSrc = (raw?: string) => {
  if (!raw) return '';
  let src = raw.trim();
  const secondData = src.indexOf('data:image', 5);
  if (secondData > 0) src = src.slice(0, secondData);
  const strayAttr = src.indexOf("' width=");
  if (strayAttr > 0) src = src.slice(0, strayAttr);
  if (
    src &&
    !src.startsWith('data:') &&
    !src.startsWith('http://') &&
    !src.startsWith('https://') &&
    !src.startsWith('/')
  ) {
    src = `/${src.replace(/^\.*\/?/, '')}`;
  }
  return src;
};

const formatPostDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return value;
  }
};

// --- کاروسل تصاویر ---
const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoPlay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
    setAutoPlay(false);
  };

  const slide = carouselData[currentSlide];

  return (
    <div 
      className="relative w-full h-48 sm:h-60 md:h-72 rounded-3xl overflow-hidden shadow-2xl group"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* تصویر */}
      <img
        src={slide.image}
        alt={slide.title}
        className="w-full h-full object-cover transition-transform duration-500"
      />


      {/* دکمه‌های ناوبری */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
      >
        ❯
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
      >
        ❮
      </button>

      {/* نقاط ناوبری */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {carouselData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'w-2.5 bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// --- بخش اصلی صفحه ---
export default function Home() {
  const { posts } = useExplore();
  const { toggleSave, isSaved } = useSave();
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const featuredExplorePosts = useMemo(() => {
    if (!isMounted) return [];
    return [...posts].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 3);
  }, [posts, isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!saveBanner) return;
    const timeout = setTimeout(() => setSaveBanner(null), 3000);
    return () => clearTimeout(timeout);
  }, [saveBanner]);

  const handleSaveNarrative = (postId: string) => {
    const result = toggleSave(postId);
    if (result.message) {
      setSaveBanner(result.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-10">
        {/* قهرمان صفحه اصلی ساده‌شده */}
        <section className="space-y-6">
          <div className="rounded-[28px] bg-gradient-to-br from-rose-500 to-orange-400 p-6 md:p-8 text-white shadow-2xl space-y-4 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
              روایت تصویری از ایثار ۱۲ روزه
            </h1>
            <p className="text-white/90 text-sm md:text-base">
              در دوازده روزِ آتش و آسمانِ سرخ، روایت ما از میان غبار و نور برخاست؛
              صدایی که بر ویرانه‌ها ایستاد و از ایثار گفت، از دستانی که در دلِ تاریکی چراغ شدند.
              این دکلمه، تصویرِ لحظه‌هایی‌ست که فراموش نمی‌شوند.
            </p>
            <div className="pt-2">
              <Link
                href="/community-path"
                className="inline-block rounded-full bg-white text-rose-600 px-5 py-2 text-sm font-semibold hover:bg-white/90"
              >
                مسیر مشارکت اجتماعی
              </Link>
            </div>
          </div>
        </section>

        {/* جستجوی سراسری مینیمال */}
        <section className="space-y-3">
          {(() => {
            const [query, setQuery] = ((): [string, (v: string) => void] => {
              // use a small component inline to keep state per render
              const [q, setQ] = useState('');
              return [q, setQ];
            })();

            const combined = useMemo(() => {
              const narr = narratives.map((n: any) => ({
                title: n.title,
                description: n.description,
                content: n.content,
                image: n.image,
                href: `/narratives/${n.slug}`,
                tag: 'روایت جنگی',
              }));
              const soli = solidarity.map((s: any) => ({
                title: s.title,
                description: s.description,
                content: s.content,
                image: s.image,
                href: `/solidarity-narratives/${s.slug}`,
                tag: 'روایت همدلی',
              }));
              const mts = martyrs.map((m: any) => ({
                title: m.name,
                description: m.shortDescription,
                image: m.image,
                href: `/nuclear-martyrs/${m.slug}`,
                tag: 'شهید',
              }));
              return [...narr, ...soli, ...mts];
            }, []);

            const results = useMemo(() => {
              const q = query.trim().toLowerCase();
              if (!q) return [] as any[];
              return combined.filter((it: any) => {
                const hay = [it.title, it.description || '', ...(it.content || [])]
                  .join(' ')
                  .toLowerCase();
                return hay.includes(q);
              }).slice(0, 8);
            }, [query, combined]);

            return (
              <div className="space-y-2">
                <div className="max-w-3xl mx-auto w-full px-2 sm:px-0">
                  <div className="relative">
                    <input
                      type="search"
                      aria-label="جستجوی سراسری"
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
                </div>

                {query && (
                  <div className="max-w-3xl mx-auto w-full rounded-lg border border-gray-200 bg-white">
                    <ul className="divide-y divide-gray-100">
                      {results.map((r, idx) => (
                        <li key={idx} className="p-3 text-sm hover:bg-gray-50">
                          <Link href={r.href} className="flex items-center gap-3">
                            <span className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] border border-gray-200 text-gray-600">
                              {r.tag}
                            </span>
                            <span className="font-semibold text-gray-900">{r.title}</span>
                            {r.description && (
                              <span className="text-gray-500 truncate">— {r.description}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                      {results.length === 0 && (
                        <li className="p-3 text-xs text-gray-500">نتیجه‌ای یافت نشد.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
        </section>

        {/* کاروسل تصاویر با ارتفاع کمتر */}
        <section>
          <Carousel />
        </section>

        {/* ۲. بخش روایات */}
        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="section-title">روایات</h2>
            <span className="text-sm text-gray-500">۳ روایت شاخص در دسترس است</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="order-2 md:order-1">
              <CategoryCard title="شهدای جنگ" href="/nuclear-martyrs" iconName="شهدای هسته ای" />
            </div>
            <div className="order-1 md:order-2">
              <CategoryCard title="روایات جنگ" href="/narratives" iconName="روایات جنگ" />
            </div>
            <div className="order-3 md:order-3">
              <CategoryCard title="روایات همدلی" href="/solidarity-narratives" iconName="روایات همدلی" />
            </div>
          </div>
          {saveBanner && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-700">
              {saveBanner}
            </div>
          )}
          {featuredExplorePosts.length > 0 && (
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-4 space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-semibold text-gray-900">روایت‌های تصویری منتخب</span>
                <Link href="/explore" className="text-rose-600 font-semibold">
                  همه را ببین
                </Link>
              </div>
              <div className="space-y-3">
                {featuredExplorePosts.map((post) => (
                  <article
                    key={post.id}
                    className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="relative h-28 w-28 rounded-2xl overflow-hidden border border-white flex-shrink-0">
                      <Link
                        href={`/explore?post=${post.id}`}
                        className="block h-full w-full relative"
                      >
                        <Image
                          src={normalizeImageSrc(post.image) || '/placeholder.jpg'}
                          alt={post.caption}
                          fill
                          className="object-cover"
                          sizes="120px"
                          unoptimized={
                            typeof post.image === 'string' &&
                            (post.image.startsWith('http') || post.image.startsWith('data:'))
                          }
                        />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleSaveNarrative(post.id)}
                        className={`absolute top-2 left-2 rounded-full border px-2 py-1 text-xs font-semibold backdrop-blur ${
                          isSaved(post.id)
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white/80 text-gray-700 border-gray-200'
                        }`}
                      >
                        <Bookmark
                          size={16}
                          fill={isSaved(post.id) ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-bold text-gray-900">{post.authorName}</p>
                      <p className="text-xs text-gray-500 line-clamp-3">{post.caption}</p>
                      <span className="text-[11px] text-gray-400 block">
                        {formatPostDate(post.createdAt)}
                      </span>
                      <Link
                        href={`/explore?post=${post.id}`}
                        className="inline-flex items-center text-xs font-semibold text-rose-600"
                      >
                        مشاهده در اکسپلور
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>
    </Layout>
  );
}
