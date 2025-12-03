'use client';

import React, { useMemo, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { useExplore } from '@/components/ExploreContext';
import type { ExploreComment, ExplorePost } from '@/components/ExploreContext';
import { useAuth } from '@/components/AuthContext';
import { useSettings } from '@/components/SettingsContext';
import { useSave } from '@/components/SaveContext';
import { useFollow } from '@/components/FollowContext';
import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Camera, Heart, MessageCircle, SendHorizontal } from 'lucide-react';

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const normalizeImageSrc = (raw: string) => {
  let src = (raw || '').trim();
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
  if (!src) {
    src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI0YxRjFEMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2Ij5FeHBsb3JlPC90ZXh0Pjwvc3ZnPg==";
  }
  return src;
};

const initials = (value?: string) => {
  if (!value) return 'روایت';
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

const buildCommentDraftKey = (postId: string, parentId?: string) =>
  (parentId ? `${postId}:${parentId}` : `${postId}:root`);

export default function ExplorePage() {
  const { posts, toggleLike, addComment, createPost } = useExplore();
  const { currentUser } = useAuth();
  const { profile } = useSettings();
  const { toggleSave, isSaved } = useSave();
  const { isFollowing, toggleFollow } = useFollow();
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [composerVisibility, setComposerVisibility] = useState<Record<string, boolean>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [composer, setComposer] = useState({ caption: '', image: '' });
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLike = (postId: string) => {
    if (!currentUser) {
      setBanner('برای پسندیدن روایت باید ابتدا وارد شوید.');
      return;
    }
    const result = toggleLike({ postId, userId: currentUser.id });
    if (!result.success && result.message) {
      setBanner(result.message);
    }
  };

  const handleSavePost = (postId: string) => {
    const result = toggleSave(postId);
    if (result.message) {
      setBanner(result.message);
    }
  };

  const handleFollowAuthor = (authorId: string) => {
    const result = toggleFollow(authorId);
    if (result.message) {
      setBanner(result.message);
    }
  };

  const handleSubmitComment = (postId: string, parentId?: string) => {
    const draftKey = buildCommentDraftKey(postId, parentId);
    const draft = (commentDrafts[draftKey] || '').trim();
    if (!draft) return;
    if (!currentUser) {
      setBanner('برای ارسال نظر باید وارد شوید.');
      return;
    }
    const result = addComment({
      postId,
      userId: currentUser.id,
      authorName: currentUser.username,
      body: draft,
      parentId,
    });
    if (!result.success && result.message) {
      setBanner(result.message);
      return;
    }
    setCommentDrafts((prev) => ({ ...prev, [draftKey]: '' }));
    if (parentId) {
      setComposerVisibility((prev) => ({ ...prev, [draftKey]: false }));
    }
  };

  const toggleCommentComposer = (postId: string, parentId?: string) => {
    if (!currentUser) {
      setBanner('برای ارسال نظر باید وارد شوید.');
      return;
    }
    const key = buildCommentDraftKey(postId, parentId);
    setComposerVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setComposer((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSharePost = () => {
    if (!currentUser) {
      setBanner('برای ارسال پست وارد شوید.');
      return;
    }
    if (!composer.image) {
      setBanner('ابتدا تصویر را انتخاب کنید.');
      return;
    }
    const result = createPost({
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: profile.avatar,
      image: composer.image,
      caption: composer.caption,
    });
    if (!result.success && result.message) {
      setBanner(result.message);
      return;
    }
    setBanner('پست شما به اکسپلور اضافه شد.');
    setComposer({ caption: '', image: '' });
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const cards = useMemo(
    () => [...posts].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [posts]
  );

  const selectedIndex = useMemo(() => {
    if (!selectedPostId) return -1;
    return cards.findIndex((post) => post.id === selectedPostId);
  }, [selectedPostId, cards]);

  const selectedPost = selectedIndex >= 0 ? cards[selectedIndex] : null;

  const commentGroups = useMemo(() => {
    if (!selectedPost) return {};
    return selectedPost.comments.reduce<Record<string, ExploreComment[]>>((acc, comment) => {
      const key = comment.parentId ?? 'root';
      if (!acc[key]) acc[key] = [];
      acc[key].push(comment);
      return acc;
    }, {});
  }, [selectedPost]);

  const openPost = (post: ExplorePost) => {
    setSelectedPostId(post.id);
  };

  const closeModal = () => {
    setSelectedPostId(null);
  };

  if (selectedPost) {
    const liked = currentUser ? selectedPost.likes.includes(currentUser.id) : false;
    const rootComposerKey = buildCommentDraftKey(selectedPost.id);
    const rootComposerVisible = composerVisibility[rootComposerKey];
    const rootComments = commentGroups['root'] || [];
    const renderCommentThread = (comment: ExploreComment): React.ReactNode => {
      const replies = commentGroups[comment.id] || [];
      const replyKey = buildCommentDraftKey(selectedPost.id, comment.id);
      const isReply = Boolean(comment.parentId);
      return (
        <div key={comment.id} className="space-y-2">
          <div
            className={`rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2 ${
              isReply ? 'mr-6' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{comment.authorName}</p>
                <p className="text-[11px] text-gray-400">{formatDate(comment.createdAt)}</p>
              </div>
              {currentUser && (
                <button
                  onClick={() => toggleCommentComposer(selectedPost.id, comment.id)}
                  className="text-xs font-semibold text-rose-600"
                >
                  پاسخ
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">{comment.body}</p>
          </div>
          {composerVisibility[replyKey] && currentUser && (
            <div className={`flex items-center gap-2 ${isReply ? 'mr-6' : ''}`}>
              <input
                type="text"
                value={commentDrafts[replyKey] || ''}
                onChange={(e) =>
                  setCommentDrafts((prev) => ({
                    ...prev,
                    [replyKey]: e.target.value,
                  }))
                }
                placeholder={`پاسخ به ${comment.authorName}`}
                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              />
              <button
                onClick={() => handleSubmitComment(selectedPost.id, comment.id)}
                className="text-sm font-semibold text-rose-600"
              >
                ارسال
              </button>
            </div>
          )}
          {replies.length > 0 && (
            <div className="space-y-2 border-r border-dashed border-gray-200 pr-4 mr-3">
              {replies.map((reply) => renderCommentThread(reply))}
            </div>
          )}
        </div>
      );
    };
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={closeModal}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold"
              >
                بازگشت به اکسپلور
              </button>
              <p className="text-xs text-gray-500">{formatDate(selectedPost.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              {selectedIndex > 0 && (
                <button
                  onClick={() => setSelectedPostId(cards[selectedIndex - 1].id)}
                  className="rounded-full border border-gray-200 px-3 py-1"
                >
                  پست قبلی
                </button>
              )}
              {selectedIndex < cards.length - 1 && (
                <button
                  onClick={() => setSelectedPostId(cards[selectedIndex + 1].id)}
                  className="rounded-full border border-gray-200 px-3 py-1"
                >
                  پست بعدی
                </button>
              )}
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2 items-start">
            <div className="w-full bg-black rounded-[32px] overflow-hidden">
              <div className="relative w-full pb-[125%]">
                <Image
                  src={normalizeImageSrc(selectedPost.image)}
                  alt={selectedPost.caption}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  unoptimized={
                    selectedPost.image.startsWith('http') || selectedPost.image.startsWith('data:')
                  }
                />
              </div>
            </div>
            <div className="space-y-4 rounded-[32px] border border-white/60 bg-white p-5 shadow">
              <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-600">
                    {selectedPost.authorAvatar ? (
                      <Image
                        src={normalizeImageSrc(selectedPost.authorAvatar)}
                        alt={selectedPost.authorName}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      initials(selectedPost.authorName)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selectedPost.authorName}</p>
                    <p className="text-xs text-gray-500">{formatDate(selectedPost.createdAt)}</p>
                  </div>
                </div>
                {currentUser?.id !== selectedPost.authorId && (
                  <button
                    onClick={() => handleFollowAuthor(selectedPost.authorId)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                      isFollowing(selectedPost.authorId)
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {isFollowing(selectedPost.authorId) ? 'دنبال شده' : 'دنبال کردن'}
                  </button>
                )}
              </header>
              <p className="text-sm text-gray-900 leading-relaxed">
                <span className="font-bold">{selectedPost.authorName}</span> {selectedPost.caption}
              </p>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                {rootComments.length === 0 ? (
                  <p className="text-xs text-gray-500">هنوز نظری ثبت نشده است.</p>
                ) : (
                  rootComments.map((comment) => renderCommentThread(comment))
                )}
              </div>
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3 flex-wrap text-gray-700">
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${
                      liked ? 'bg-rose-600 text-white border-rose-600' : 'border-gray-200'
                    }`}
                  >
                    <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                    {selectedPost.likes.length}
                  </button>
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold">
                    <MessageCircle size={18} />
                    {selectedPost.comments.length}
                  </span>
                  <button
                    onClick={() => handleSavePost(selectedPost.id)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${
                      isSaved(selectedPost.id)
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    <Bookmark size={18} fill={isSaved(selectedPost.id) ? 'currentColor' : 'none'} />
                    ذخیره
                  </button>
                </div>
                {currentUser ? (
                  <div className="space-y-2">
                    {!rootComposerVisible ? (
                      <button
                        onClick={() => toggleCommentComposer(selectedPost.id)}
                        className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700"
                      >
                        نوشتن نظر جدید
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={commentDrafts[rootComposerKey] || ''}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [rootComposerKey]: e.target.value,
                            }))
                          }
                          placeholder="نظر خود را بنویسید..."
                          className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                        />
                        <button
                          onClick={() => handleSubmitComment(selectedPost.id)}
                          className="text-sm font-semibold text-rose-600"
                        >
                          ارسال
                        </button>
                        <button
                          onClick={() => toggleCommentComposer(selectedPost.id)}
                          className="text-xs font-semibold text-gray-400"
                        >
                          انصراف
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/profile" className="text-xs text-rose-600 font-semibold">
                    برای مشارکت وارد حساب خود شوید یا آن را بسازید.
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Explore</p>
            <h1 className="text-3xl font-black text-gray-900">اکسپلور روایت</h1>
            <p className="text-sm text-gray-500 mt-1">
              ترکیبی از قاب‌های کاربران و روایت‌های آرشیوی در یک شبکه تصویری هماهنگ.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/profile" className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold">
              پروفایل من
            </Link>
            <Link href="#composer" className="rounded-full bg-gray-900 text-white px-4 py-2 text-sm font-semibold">
              ساخت پست جدید
            </Link>
          </div>
        </section>

        {banner && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 flex items-center justify-between">
            <span>{banner}</span>
            <button onClick={() => setBanner(null)} aria-label="بستن" className="text-gray-500">×</button>
          </div>
        )}

        <section id="composer" className="rounded-[32px] border border-white/60 bg-white/90 p-5 shadow-lg space-y-4">
          {currentUser ? (
            <>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-600">
                  {profile.avatar ? (
                    <Image
                      src={normalizeImageSrc(profile.avatar)}
                      alt="avatar"
                      width={44}
                      height={44}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    initials(currentUser.username)
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                  placeholder="کپشن خود را بنویسید..."
                    value={composer.caption}
                    onChange={(e) => setComposer((prev) => ({ ...prev, caption: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Camera size={18} />
                  {composer.image ? 'تعویض تصویر' : 'انتخاب تصویر'}
                </button>
                <button
                  type="button"
                  onClick={handleSharePost}
                  className="flex-1 rounded-2xl bg-gray-900 text-white px-4 py-3 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <SendHorizontal size={18} />
                  انتشار در اکسپلور
                </button>
              </div>
              {composer.image && (
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <Image
                    src={normalizeImageSrc(composer.image)}
                    alt="پیش‌نمایش پست"
                    width={900}
                    height={600}
                    className="w-full h-64 object-cover"
                    unoptimized
                  />
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
            </>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">برای اشتراک عکس وارد حساب خود شوید.</p>
              <Link href="/profile" className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white px-5 py-2 text-sm font-semibold">
                ورود یا ساخت حساب
              </Link>
            </div>
          )}
        </section>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {cards.map((post) => {
            const imageSrc = normalizeImageSrc(post.image);
            return (
              <button
                key={post.id}
                onClick={() => openPost(post)}
                className="relative aspect-square w-full rounded-3xl overflow-hidden border border-white/60 bg-gray-100 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                <Image
                  src={imageSrc}
                  alt={post.caption}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 20vw, (min-width: 768px) 30vw, 45vw"
                  unoptimized={imageSrc.startsWith('http') || imageSrc.startsWith('data:')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="inline-flex items-center gap-1">
                    <Heart size={14} fill="currentColor" />
                    {post.likes.length}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle size={14} />
                    {post.comments.length}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {cards.length === 0 && (
          <p className="text-center text-sm text-gray-500">پستی برای نمایش وجود ندارد. اولین پست را شما بگذارید.</p>
        )}
      </div>
    </Layout>
  );
}
