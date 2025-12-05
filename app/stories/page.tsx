// تمامی حقوق این فایل متعلق به تیم شهید بابایی است.
'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { useStories } from '@/components/StoryContext';
import { useAuth } from '@/components/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';

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

const relativeTime = (value: string) => {
  try {
    const target = new Date(value).getTime();
    if (Number.isNaN(target)) return '';
    const diff = Date.now() - target;
    const hours = Math.floor(diff / 3600000);
    if (hours <= 0) return 'چند لحظه پیش';
    if (hours < 24) return `${hours} ساعت پیش`;
    return `${Math.floor(hours / 24)} روز پیش`;
  } catch {
    return '';
  }
};

const StoryViewerContent = () => {
  const { stories, toggleStoryLike, sendStoryReply } = useStories();
  const { currentUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  const storyParam = searchParams?.get('story') ?? null;
  const story = stories[activeIndex];

  useEffect(() => {
    if (!stories.length) return;
    if (!storyParam) {
      setActiveIndex(0);
      return;
    }
    const idx = stories.findIndex((item) => item.id === storyParam);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [stories, storyParam]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!story) return;
    const params = new URLSearchParams(window.location.search);
    params.set('story', story.id);
    router.replace(`/stories?${params.toString()}`, { scroll: false });
  }, [story?.id, router]);

  useEffect(() => {
    setMessage('');
  }, [story?.id]);

  const handleNext = () => {
    if (!stories.length) return;
    setActiveIndex((prev) => (prev + 1) % stories.length);
    setMessage('');
  };

  const handlePrev = () => {
    if (!stories.length) return;
    setActiveIndex((prev) => (prev - 1 + stories.length) % stories.length);
    setMessage('');
  };

  const handleLike = () => {
    if (!story) return;
    if (!currentUser) {
      setFeedback('برای پسندیدن استوری ابتدا وارد شوید.');
      return;
    }
    const result = toggleStoryLike(story.id, currentUser.id);
    setFeedback(result.message ?? (result.liked ? 'استوری پسند شد.' : 'پسند حذف شد.'));
  };

  const handleSendMessage = () => {
    if (!story) return;
    if (!currentUser) {
      setFeedback('برای ارسال پیام ابتدا وارد شوید.');
      return;
    }
    const result = sendStoryReply(story.id, {
      userId: currentUser.id,
      userName: currentUser.username,
      message,
    });
    if (!result.success) {
      setFeedback(result.message ?? 'پیام ارسال نشد.');
      return;
    }
    setMessage('');
    setFeedback(result.message ?? 'پیام ارسال شد.');
  };

  const liked = story && currentUser ? story.likes.includes(currentUser.id) : false;

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    touchStartX.current = event.clientX;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = event.clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  if (!story) {
    return (
      <Layout>
        <div className="space-y-6 py-24 text-center">
          <h1 className="text-3xl font-black">استوری فعالی یافت نشد</h1>
          <p className="text-gray-500">به صفحه پروفایل بروید و اولین استوری خود را ثبت کنید.</p>
          <Link href="/profile" className="rounded-full bg-gray-900 text-white px-5 py-2 text-sm font-semibold">
            رفتن به پروفایل
          </Link>
        </div>
      </Layout>
    );
  }

  const mediaSrc = normalizeImageSrc(story.media);
  const avatarSrc = normalizeImageSrc(story.authorAvatar);
  const initials =
    story.authorName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('') || 'Story';

  return (
    <Layout>
      <div className="space-y-6">
        {feedback && (
          <div className="rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-700">
            {feedback}
          </div>
        )}
        <div
          className="relative rounded-[32px] border border-white/60 bg-white shadow-xl overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <img src={mediaSrc} alt={story.caption || story.authorName} className="w-full h-[460px] object-cover" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white text-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full border border-white/50 overflow-hidden bg-white/20 flex items-center justify-center text-xs font-semibold">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={story.authorName} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div>
                <p className="font-semibold">{story.authorName}</p>
                <p className="text-white/80 text-[11px]">{relativeTime(story.createdAt)}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold"
              type="button"
            >
              برگشت
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-white text-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                type="button"
                className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold"
              >
                قبلی
              </button>
              <button
                onClick={handleNext}
                type="button"
                className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold"
              >
                بعدی
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                  liked ? 'bg-white text-rose-600 border-white' : 'bg-black/30 text-white border-white/40'
                }`}
              >
                {liked ? 'پسند شده' : 'پسندیدن'} · {story.likes.length}
              </button>
            </div>
          </div>
        </div>

        <section className="rounded-[32px] border border-white/60 bg-white/90 p-5 shadow-xl space-y-4">
          <h2 className="text-lg font-bold">ارسال پیام خصوصی</h2>
          <div className="flex flex-col gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="پیام خود را برای صاحب استوری بنویسید..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm min-h-[80px]"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              className="rounded-full bg-rose-600 text-white px-5 py-2 text-sm font-semibold"
            >
              ارسال پیام
            </button>
          </div>
          {story.replies.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500">پیام‌های اخیر برای این استوری</p>
              <div className="space-y-2">
                {story.replies.slice(-4).map((reply) => (
                  <div key={reply.id} className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2">
                    <p className="text-sm font-semibold text-gray-900">{reply.fromName}</p>
                    <p className="text-xs text-gray-500">{reply.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default function StoriesPage() {
  return (
    <Suspense fallback={<Layout><div className="py-20 text-center text-gray-500">در حال بارگذاری استوری...</div></Layout>}>
      <StoryViewerContent />
    </Suspense>
  );
}
