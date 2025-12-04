'use client';

import React, { useMemo } from 'react';
import { useSave } from './SaveContext';
import { useExplore } from './ExploreContext';
import { useAuth } from './AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { BookmarkMinus } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

const SavedModal: React.FC = () => {
  const { isModalOpen, closeModal, savedPostIds, toggleSave } = useSave();
  const { posts } = useExplore();
  const { currentUser } = useAuth();
  const router = useRouter();

  const savedPosts = useMemo(
    () => savedPostIds
      .map((id) => posts.find((post) => post.id === id))
      .filter((post): post is NonNullable<typeof post> => Boolean(post)),
    [savedPostIds, posts]
  );

  if (!isModalOpen) return null;

  const handleOpenPost = (postId: string) => {
    closeModal();
    router.push(`/explore?post=${postId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-10 sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative z-10 w-full max-w-2xl rounded-[32px] bg-white shadow-2xl border border-white/80 p-5 space-y-4 animate-in fade-in zoom-in">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Saved</p>
            <h2 className="text-2xl font-black text-gray-900">محتواهای ذخیره‌شده</h2>
          </div>
          <button onClick={closeModal} className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600">
            بستن
          </button>
        </div>

        {!currentUser && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            برای ذخیره محتوا باید وارد حساب شوید. از پروفایل یا اکسپلور وارد شوید.
          </div>
        )}

        {currentUser && savedPosts.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-5 text-center text-sm text-gray-600">
            هنوز چیزی ذخیره نکرده‌اید. روی آیکون ذخیره کنار پست‌ها بزنید تا اینجا ظاهر شوند.
          </div>
        )}

        {currentUser && savedPosts.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
            {savedPosts.map((post) => (
              <div
                key={post.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenPost(post.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenPost(post.id);
                  }
                }}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 cursor-pointer hover:border-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
              >
                <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={normalizeImageSrc(post.image) || '/placeholder.jpg'}
                    alt={post.caption}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                    unoptimized={
                      typeof post.image === 'string' &&
                      (post.image.startsWith('http') || post.image.startsWith('data:'))
                    }
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{post.caption}</p>
                  <p className="text-[11px] text-gray-500 mt-1">توسط {post.authorName}</p>
                </div>
                <button
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(post.id);
                  }}
                >
                  <BookmarkMinus size={14} />
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <Link href="/explore" className="font-semibold text-rose-600">
            رفتن به اکسپلور
          </Link>
          <span>محتواها روی همین دستگاه ذخیره می‌شوند.</span>
        </div>
      </div>
    </div>
  );
};

export default SavedModal;
