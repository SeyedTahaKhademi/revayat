'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useSettings } from '@/components/SettingsContext';
import { useI18n } from '@/components/i18n';
import Link from 'next/link';

export default function SettingsPage() {
  const { theme, setTheme, fontSize, setFontSize, language, setLanguage } = useSettings();
  const t = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="section-title">{t.settings}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-4 bg-white/70">
            <h2 className="font-bold mb-3">{t.theme}</h2>
            <div className="flex gap-3">
              <button onClick={() => setTheme('light')} className={`px-3 py-2 rounded-xl border ${(mounted && theme==='light')?'bg-rose-100 border-rose-400':'bg-white/70'}`}>{t.light}</button>
              <button onClick={() => setTheme('dark')} className={`px-3 py-2 rounded-xl border ${(mounted && theme==='dark')?'bg-rose-100 border-rose-400':'bg-white/70'}`}>{t.dark}</button>
              <button onClick={() => setTheme('system')} className={`px-3 py-2 rounded-xl border ${(mounted && theme==='system')?'bg-rose-100 border-rose-400':'bg-white/70'}`}>{t.system}</button>
            </div>
          </div>

          <div className="rounded-2xl border p-4 bg-white/70">
            <h2 className="font-bold mb-3">{t.fontSize}</h2>
            <div className="flex gap-3">
              <button onClick={() => setFontSize('sm')} className={`px-3 py-2 rounded-xl border ${(mounted && fontSize==='sm')?'bg-rose-100 border-rose-400':'bg-white/70'}`}>{t.small}</button>
              <button onClick={() => setFontSize('md')} className={`px-3 py-2 rounded-xl border ${(mounted && fontSize==='md')?'bg-rose-100 border-rose-400':'bg-white/70'}`}>{t.medium}</button>
              <button onClick={() => setFontSize('lg')} className={`px-3 py-2 rounded-xl border ${(mounted && fontSize==='lg')?'bg-rose-100 border-rose-400':'bg-white/70'}`}>{t.large}</button>
            </div>
          </div>

          <div className="rounded-2xl border p-4 bg-white/70">
            <h2 className="font-bold mb-3">{t.language}</h2>
            <div className="flex gap-3">
              <button onClick={() => setLanguage('fa')} className={`px-3 py-2 rounded-xl border ${(mounted && language==='fa')?'bg-rose-100 border-rose-400':'bg-white/70'}`}>{t.persian}</button>
              <button onClick={() => setLanguage('en')} className={`px-3 py-2 rounded-xl border ${(mounted && language==='en')?'bg-rose-100 border-rose-400':'bg-white/70'}`}>{t.english}</button>
              <button onClick={() => setLanguage('ar')} className={`px-3 py-2 rounded-xl border ${(mounted && language==='ar')?'bg-rose-100 border-rose-400':'bg-white/70'}`}>{t.arabic}</button>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border p-4 bg-white/70 space-y-3">
          <h2 className="font-bold">درباره ما</h2>
          <p className="text-sm text-gray-700">
            این پروژه با تمرکز بر روایت‌گری جنگ ۱۲ روزه ساخته شده و تلاش کرده‌ایم تجربه‌ای سریع، مینیمال و سازگار با موبایل ارائه دهیم.
            هماهنگ‌سازی تم روشن/تاریک، راست‌به‌چپ، بهینه‌سازی عملکرد و مدیریت تصاویر خارجی از چالش‌های اصلی بوده‌اند.
          </p>
          <p className="text-sm text-gray-700">
            تیم سازنده: <span className="font-semibold">شهید ستاری</span>
          </p>
        </section>

        <div className="flex items-center justify-between">
          <Link href="/profile" className="rounded-xl px-4 py-2 border bg-white/70 font-semibold">{t.profile}</Link>
        </div>
      </div>
    </Layout>
  );
}
