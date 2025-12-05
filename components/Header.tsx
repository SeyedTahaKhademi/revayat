// تمامی حقوق این فایل متعلق به تیم شهید بابایی است.
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from './i18n';
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from './SettingsContext';
import { useSave } from './SaveContext';

const Header: React.FC = () => {
  const router = useRouter();
  const t = useI18n();
  const pathname = usePathname();
  const { language } = useSettings();
  const { openModal } = useSave();
  const isHome = pathname === '/';
  const isRTL = language !== 'en';
  return (
    <header className="fixed top-0 right-0 left-0 z-30 px-4 sm:px-6">
      <div className="mx-auto mt-2 sm:mt-3 h-12 sm:h-14 max-w-5xl rounded-xl border border-gray-200 bg-white px-3 sm:px-4 grid grid-cols-3 items-center">
        <div className="flex items-center gap-2 justify-start">
          <button
            onClick={openModal}
            aria-label="ذخیره‌ها"
            className="rounded-lg p-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            <Bookmark size={20} />
          </button>
        </div>

        <div className="flex justify-center">
          <Link href="/" className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
            روایت
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center">
            {isHome ? (
              <span className="w-9 h-9" />
            ) : (
              <button
                onClick={() => router.back()}
                aria-label={t.back}
                className="rounded-lg p-1.5 border border-gray-300 text-gray-700 bg-transparent"
              >
                {isRTL ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
              </button>
            )}
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-700">
            <span className="px-2.5 py-0.5 rounded-full border border-gray-200">
              روایت‌های روز
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-gray-200">
              قهرمانان مقاومت
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
