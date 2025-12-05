// تمامی حقوق این فایل متعلق به تیم شهید بابایی است.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/components/AuthContext';
import { useExplore } from '@/components/ExploreContext';
import { useSettings } from '@/components/SettingsContext';
import { useFollow } from '@/components/FollowContext';
import { useStories } from '@/components/StoryContext';
import type { Story } from '@/components/StoryContext';
import Link from 'next/link';
import Image from 'next/image';

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

const storyTimeRemaining = (value: string) => {
  try {
    const created = new Date(value).getTime();
    if (Number.isNaN(created)) return 'نامشخص';
    const diff = 24 * 60 * 60 * 1000 - (Date.now() - created);
    if (diff <= 0) return 'منقضی شده';
    const hours = Math.ceil(diff / 3600000);
    return `${hours} ساعت تا پایان`;
  } catch {
    return 'نامشخص';
  }
};

export default function ProfilePage() {
  const { currentUser, login, register, logout, accounts } = useAuth();
  const { posts, createPost } = useExplore();
  const { stories, addStory, updateStory, deleteStory } = useStories();
  const { profile, setProfile } = useSettings();
  const { getFollowers, getFollowing, toggleFollow, isFollowing } = useFollow();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    fullName: '',
    phone: '',
    password: '',
    gender: 'female',
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [composer, setComposer] = useState({ caption: '', image: '' });
  const postInputRef = useRef<HTMLInputElement>(null);
  const [storyComposer, setStoryComposer] = useState({ caption: '', media: '' });
  const storyInputRef = useRef<HTMLInputElement>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [openList, setOpenList] = useState<'followers' | 'following' | null>(null);

  const myPosts = useMemo(
    () => (currentUser ? posts.filter((post) => post.authorId === currentUser.id) : []),
    [posts, currentUser]
  );
  const myStories = useMemo(
    () => (currentUser ? stories.filter((story) => story.authorId === currentUser.id) : []),
    [stories, currentUser]
  );
  const postsCount = myPosts.length;
  const followerIds = useMemo(
    () => (currentUser ? getFollowers(currentUser.id) : []),
    [currentUser, getFollowers]
  );
  const followingIds = useMemo(
    () => (currentUser ? getFollowing(currentUser.id) : []),
    [currentUser, getFollowing]
  );
  const followerAccounts = useMemo(
    () => accounts.filter((account) => followerIds.includes(account.id)),
    [accounts, followerIds]
  );
  const followingAccounts = useMemo(
    () => accounts.filter((account) => followingIds.includes(account.id)),
    [accounts, followingIds]
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(loginForm.phone, loginForm.password);
    if (!result.success) {
      setAuthSuccess(null);
      setAuthError(result.message || 'ورود انجام نشد.');
      return;
    }
    setAuthError(null);
    setAuthSuccess('با موفقیت وارد شدید. اکنون می‌توانید پست بگذارید.');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const result = register({
      username: registerForm.username,
      fullName: registerForm.fullName,
      phone: registerForm.phone,
      password: registerForm.password,
      gender: registerForm.gender as 'female' | 'male',
    });
    if (!result.success) {
      setAuthSuccess(null);
      setAuthError(result.message || 'ثبت‌نام انجام نشد.');
      return;
    }
    setAuthError(null);
    setAuthSuccess('حساب ساخته شد و وارد شدید. مستقیم به اکسپلور سر بزنید.');
  };

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile({ avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleComposerImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setComposer((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleStoryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setStoryComposer((prev) => ({ ...prev, media: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSharePost = () => {
    if (!currentUser) {
      setAuthError('برای ارسال پست ابتدا وارد شوید.');
      return;
    }
    if (!composer.image) {
      setAuthError('تصویر پست انتخاب نشده است.');
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
      setAuthError(result.message);
      return;
    }
    setAuthError(null);
    setAuthSuccess('پست شما ذخیره و در اکسپلور نمایش داده شد.');
    setComposer({ caption: '', image: '' });
    if (postInputRef.current) postInputRef.current.value = '';
  };

  const handleShareStory = () => {
    if (!currentUser) {
      setAuthError('برای ارسال استوری ابتدا وارد شوید.');
      return;
    }
    if (!storyComposer.media) {
      setAuthError('تصویر یا ویدیو برای استوری انتخاب نشده است.');
      return;
    }
    if (editingStory) {
      const result = updateStory(editingStory.id, {
        userId: currentUser.id,
        caption: storyComposer.caption,
        media: storyComposer.media || editingStory.media,
      });
      if (!result.success) {
        setAuthError(result.message || 'استوری ویرایش نشد.');
        return;
      }
      setAuthError(null);
      setAuthSuccess('استوری شما ویرایش شد.');
      setEditingStory(null);
    } else {
      const result = addStory({
        authorId: currentUser.id,
        authorName: currentUser.username,
        authorAvatar: profile.avatar,
        media: storyComposer.media,
        caption: storyComposer.caption,
      });
      if (!result.success) {
        setAuthError(result.message || 'استوری ارسال نشد.');
        return;
      }
      setAuthError(null);
      setAuthSuccess('استوری شما ثبت شد و به مدت ۲۴ ساعت نمایش داده می‌شود.');
    }
    setStoryComposer({ caption: '', media: '' });
    if (storyInputRef.current) storyInputRef.current.value = '';
  };

  const handleEditStory = (story: Story) => {
    setStoryComposer({ caption: story.caption || '', media: story.media });
    setEditingStory(story);
  };

  const handleCancelEditStory = () => {
    setEditingStory(null);
    setStoryComposer({ caption: '', media: '' });
    if (storyInputRef.current) storyInputRef.current.value = '';
  };

  const handleDeleteStory = (storyId: string) => {
    if (!currentUser) {
      setAuthError('برای حذف استوری ابتدا وارد شوید.');
      return;
    }
    const result = deleteStory(storyId, currentUser.id);
    if (!result.success) {
      setAuthError(result.message || 'استوری حذف نشد.');
      return;
    }
    if (editingStory?.id === storyId) {
      handleCancelEditStory();
    }
    setAuthError(null);
    setAuthSuccess('استوری حذف شد.');
  };

  const handleManageFollow = (targetId: string) => {
    const result = toggleFollow(targetId);
    if (!result.success && result.message) {
      setAuthError(result.message);
      return;
    }
    if (result.message) {
      setAuthSuccess(result.message);
    }
  };

  const avatarSrc = normalizeImageSrc(profile.avatar);

  const toggleList = (list: 'followers' | 'following') => {
    setOpenList((prev) => (prev === list ? null : list));
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Profile</p>
            <h1 className="text-3xl font-black">پروفایل / حساب کاربری</h1>
            <p className="text-sm text-gray-500 mt-1">
              اینجا فرم ورود یا ساخت حساب قرار دارد و می‌توانید اطلاعات پروفایل، دنبال‌کننده‌ها و پست‌های خود را مدیریت کنید.
            </p>
          </div>
          {currentUser && (
            <Link href="/explore" className="rounded-full border border-gray-900 px-4 py-2 text-sm font-semibold">
              رفتن به اکسپلور
            </Link>
          )}
        </div>

        {authError && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{authError}</div>}
        {authSuccess && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{authSuccess}</div>}

        {!currentUser && (
          <>
            <div className="flex gap-3 rounded-2xl border border-gray-200 bg-white/70 p-1 text-sm font-semibold">
              <button
                className={`flex-1 rounded-2xl px-4 py-2 ${mode === 'login' ? 'bg-gray-900 text-white' : ''}`}
                onClick={() => setMode('login')}
              >
                ورود
              </button>
              <button
                className={`flex-1 rounded-2xl px-4 py-2 ${mode === 'register' ? 'bg-gray-900 text-white' : ''}`}
                onClick={() => setMode('register')}
              >
                ساخت حساب
              </button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="rounded-3xl border border-white/60 bg-white/80 p-5 space-y-4">
                <h2 className="text-xl font-bold">ورود سریع</h2>
                <label className="flex flex-col gap-1 text-sm">
                  شماره تلفن
                  <input
                    type="tel"
                    value={loginForm.phone}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="rounded-2xl border border-gray-200 bg-white px-3 py-2"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  رمز عبور
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="rounded-2xl border border-gray-200 bg-white px-3 py-2"
                    required
                  />
                </label>
                <button type="submit" className="w-full rounded-2xl bg-gray-900 text-white py-2 font-semibold">
                  ورود
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="rounded-3xl border border-white/60 bg-white/80 p-5 space-y-4">
                <h2 className="text-xl font-bold">فرم ساخت حساب</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1 text-sm">
                    نام کاربری (نمایشی)
                    <input
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, username: e.target.value }))}
                      className="rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    نام واقعی
                    <input
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    شماره تلفن
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    رمز عبور
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                      className="rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      required
                    />
                  </label>
                </div>
                <div className="space-y-2 text-sm">
                  <span>جنسیت</span>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={registerForm.gender === 'female'}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, gender: e.target.value }))}
                      />
                      دختر
                    </label>
                    <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={registerForm.gender === 'male'}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, gender: e.target.value }))}
                      />
                      پسر
                    </label>
                  </div>
                </div>
                <button type="submit" className="w-full rounded-2xl bg-gray-900 text-white py-2 font-semibold">
                  ساخت حساب و ورود
                </button>
              </form>
            )}
          </>
        )}

        {currentUser && (
          <>
            <section className="rounded-[32px] border border-white/60 bg-white/90 p-5 shadow-xl space-y-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center text-lg font-bold text-gray-600">
                    {profile.avatar ? (
                      <Image
                        src={avatarSrc}
                        alt="avatar"
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      initials(currentUser.username)
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-black">{currentUser.username}</p>
                    <p className="text-sm text-gray-500">{currentUser.fullName}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>{currentUser.phone}</span>
                      <span>{currentUser.gender === 'female' ? 'دختر' : 'پسر'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-center">
                  <div className="px-4 py-2 rounded-2xl border border-gray-100 bg-gray-50">
                    <p className="text-xl font-black">{postsCount}</p>
                    <p className="text-xs text-gray-500">پست</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleList('followers')}
                    className={`px-4 py-2 rounded-2xl border text-center ${
                      openList === 'followers'
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-900'
                    }`}
                  >
                    <p className="text-xl font-black">{followerIds.length}</p>
                    <p className="text-xs">دنبال‌کننده</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleList('following')}
                    className={`px-4 py-2 rounded-2xl border text-center ${
                      openList === 'following'
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-900'
                    }`}
                  >
                    <p className="text-xl font-black">{followingIds.length}</p>
                    <p className="text-xs">دنبال‌شونده</p>
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={logout} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold">
                    خروج
                  </button>
                  {currentUser.role === 'admin' && (
                    <Link href="/admin" className="rounded-full border border-rose-500 text-rose-600 px-4 py-2 text-sm font-semibold">
                      مدیریت کاربران
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="px-3 py-1 rounded-full border border-gray-200">حساب فعال</span>
                <span className="px-3 py-1 rounded-full border border-gray-200">شبکه دنبال‌کننده‌ها فعال است</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold"
                >
                  تغییر آواتار
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
              </div>
            </section>

            {openList === 'followers' && (
              <section className="rounded-[32px] border border-white/60 bg-white/90 p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">دنبال‌کننده‌ها</h2>
                  <button
                    onClick={() => setOpenList(null)}
                    className="text-xs font-semibold text-gray-400"
                  >
                    بستن
                  </button>
                </div>
                {followerAccounts.length === 0 ? (
                  <p className="text-sm text-gray-500">هنوز کسی شما را دنبال نکرده است.</p>
                ) : (
                  <div className="space-y-2">
                    {followerAccounts.map((account) => {
                      const followingBack = isFollowing(account.id);
                      const isSelf = currentUser?.id === account.id;
                      return (
                        <div
                          key={account.id}
                          className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{account.username}</p>
                            <p className="text-xs text-gray-500">{account.fullName}</p>
                          </div>
                          {!isSelf && (
                            <button
                              onClick={() => handleManageFollow(account.id)}
                              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                                followingBack ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700'
                              }`}
                            >
                              {followingBack ? 'دنبال شده' : 'دنبال کردن'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {openList === 'following' && (
              <section className="rounded-[32px] border border-white/60 bg-white/90 p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">دنبال‌شونده‌ها</h2>
                  <button
                    onClick={() => setOpenList(null)}
                    className="text-xs font-semibold text-gray-400"
                  >
                    بستن
                  </button>
                </div>
                {followingAccounts.length === 0 ? (
                  <p className="text-sm text-gray-500">کسی را دنبال نمی‌کنید؛ از اکسپلور شروع کنید.</p>
                ) : (
                  <div className="space-y-2">
                    {followingAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{account.username}</p>
                          <p className="text-xs text-gray-500">{account.fullName}</p>
                        </div>
                        <button
                          onClick={() => handleManageFollow(account.id)}
                          className="rounded-full px-3 py-1 text-xs font-semibold border border-rose-200 text-rose-600"
                        >
                          لغو دنبال
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="rounded-[32px] border border-white/60 bg-white/90 p-5 shadow-xl space-y-4">
              <h2 className="text-lg font-bold">ساخت پست جدید</h2>
              <div className="space-y-3">
                <textarea
                  value={composer.caption}
                  onChange={(e) => setComposer((prev) => ({ ...prev, caption: e.target.value }))}
                  placeholder="کپشن خود را بنویسید..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm min-h-[80px]"
                />
                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => postInputRef.current?.click()}
                    className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold"
                  >
                    {composer.image ? 'تعویض تصویر' : 'انتخاب تصویر'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSharePost}
                    className="flex-1 rounded-2xl bg-gray-900 text-white px-4 py-3 text-sm font-bold"
                  >
                    انتشار
                  </button>
                </div>
                {composer.image && (
                  <div className="rounded-2xl border border-gray-100 overflow-hidden">
                    <Image
                      src={normalizeImageSrc(composer.image)}
                      alt="پیش‌نمایش"
                      width={900}
                      height={900}
                      className="w-full h-64 object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <input ref={postInputRef} type="file" accept="image/*" className="hidden" onChange={handleComposerImage} />
              </div>
            </section>

            <section className="rounded-[32px] border border-white/60 bg-white/90 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold">استوری ۲۴ ساعته</h2>
                  {editingStory && (
                    <p className="text-xs text-rose-500 font-semibold">
                      در حال ویرایش استوری: {editingStory.caption || editingStory.id}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500">{myStories.length} استوری فعال</span>
              </div>
              <div className="space-y-3">
                <textarea
                  value={storyComposer.caption}
                  onChange={(e) => setStoryComposer((prev) => ({ ...prev, caption: e.target.value }))}
                  placeholder="کپشن یا متن کوتاه برای استوری..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm min-h-[70px]"
                />
                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => storyInputRef.current?.click()}
                    className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold"
                  >
                    {storyComposer.media ? 'تعویض مدیا' : 'انتخاب تصویر یا ویدیو'}
                  </button>
                  <button
                    type="button"
                    onClick={handleShareStory}
                    className="flex-1 rounded-2xl bg-rose-600 text-white px-4 py-3 text-sm font-bold"
                  >
                    {editingStory ? 'ذخیره تغییرات' : 'انتشار استوری'}
                  </button>
                  {editingStory && (
                    <button
                      type="button"
                      onClick={handleCancelEditStory}
                      className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600"
                    >
                      انصراف از ویرایش
                    </button>
                  )}
                </div>
                <input
                  ref={storyInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleStoryImage}
                />
                {storyComposer.media && (
                  <div className="rounded-2xl border border-gray-100 overflow-hidden">
                    <Image
                      src={normalizeImageSrc(storyComposer.media)}
                      alt="پیش‌نمایش استوری"
                      width={900}
                      height={900}
                      className="w-full h-56 object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {myStories.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    هنوز استوری فعالی ندارید. استوری‌ها به‌طور خودکار پس از ۲۴ ساعت حذف می‌شوند.
                  </p>
                ) : (
                  myStories.map((story) => (
                    <div
                      key={story.id}
                      className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl overflow-hidden bg-gray-200">
                          <img
                            src={normalizeImageSrc(story.media)}
                            alt={story.caption || 'استوری'}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {story.caption || 'استوری بدون کپشن'}
                          </p>
                          <p className="text-xs text-gray-500">{storyTimeRemaining(story.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditStory(story)}
                          className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDeleteStory(story.id)}
                          className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/60 bg-white/90 p-5 shadow-xl space-y-4">
              <h2 className="text-lg font-bold">ویرایش پروفایل محلی</h2>
              <p className="text-sm text-gray-500">این اطلاعات برای نمایش آواتار و بیو روی همین دستگاه ذخیره می‌شود.</p>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1 text-sm">
                    نام
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile({ name: e.target.value })}
                      className="rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    شماره موبایل
                    <input
                      value={profile.mobile}
                      onChange={(e) => setProfile({ mobile: e.target.value })}
                      className="rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      inputMode="tel"
                      pattern="^[0-9+\\-()\\s]{7,}$"
                      required
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-1 text-sm">
                  بیو
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ bio: e.target.value })}
                    className="rounded-2xl border border-gray-200 bg-white px-3 py-2 min-h-[100px]"
                  />
                </label>
              </form>
            </section>

            <section className="rounded-[32px] border border-white/60 bg-white/90 p-5 shadow-xl space-y-4">
              <h2 className="text-lg font-bold">پست‌های شما</h2>
              {myPosts.length === 0 ? (
                <p className="text-sm text-gray-500">هنوز پستی ندارید؛ از بالا یک پست بسازید.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {myPosts.map((post) => (
                    <div key={post.id} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                      <Image
                        src={normalizeImageSrc(post.image)}
                        alt={post.caption}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 20vw, 45vw"
                        unoptimized={post.image.startsWith('http') || post.image.startsWith('data:')}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs p-2">
                        <p className="truncate">{post.caption}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
