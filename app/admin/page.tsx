'use client';

import React, { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function AdminPage() {
  const { currentUser, accounts, deleteAccount } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);

  const sortedAccounts = useMemo(
    () =>
      [...accounts].sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1
      ),
    [accounts]
  );

  const handleDelete = (accountId: string) => {
    const result = deleteAccount(accountId);
    setFeedback(result.message || (result.success ? 'حساب حذف شد.' : 'عملیات انجام نشد.'));
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="space-y-4">
          <h1 className="text-3xl font-black">نیازمند ورود</h1>
          <p className="text-sm text-gray-600">
            برای دیدن داشبورد مدیریت، ابتدا با حساب ادمین وارد شوید.
          </p>
          <Link href="/auth" className="rounded-full border border-gray-900 px-4 py-2 text-sm font-semibold">
            رفتن به صفحه ورود
          </Link>
        </div>
      </Layout>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <Layout>
        <div className="space-y-4">
          <h1 className="text-3xl font-black">دسترسی محدود</h1>
          <p className="text-sm text-gray-600">
            فقط ادمین می‌تواند لیست کاربران را ببیند و مدیریت کند.
          </p>
          <Link href="/explore" className="rounded-full border border-gray-900 px-4 py-2 text-sm font-semibold">
            برگشت به اکسپلور
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500">Admin</p>
          <h1 className="text-3xl font-black">داشبورد مدیریت کاربران</h1>
          <p className="text-sm text-gray-600 mt-1">
            در این صفحه می‌توانید حساب‌های فعال را ببینید، دنبال‌کننده‌ها را بررسی کنید و در صورت نیاز حساب‌های کاربری را حذف کنید.
          </p>
        </div>

        {feedback && (
          <div className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 text-sm">
            {feedback}
            <button onClick={() => setFeedback(null)} className="ml-3 text-gray-500">×</button>
          </div>
        )}

        <div className="rounded-3xl border border-white/60 bg-white/80 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 mb-3">
            <span>تعداد کل حساب‌ها: {accounts.length}</span>
            <span>کاربران معمولی: {accounts.filter((a) => a.role === 'user').length}</span>
          </div>
          <div className="space-y-4">
            {sortedAccounts.map((account) => (
              <div key={account.id} className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900">{account.username}</p>
                    <p className="text-xs text-gray-500">{account.fullName}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      account.role === 'admin'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {account.role === 'admin' ? 'ادمین' : 'کاربر'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                  <div>
                    <span className="block text-[11px] text-gray-500">شماره تلفن</span>
                    {account.phone}
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500">جنسیت</span>
                    {account.gender === 'female' ? 'دختر' : 'پسر'}
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500">تاریخ ایجاد</span>
                    {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(account.createdAt))}
                  </div>
                </div>
                {account.role !== 'admin' && (
                  <div>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-sm text-rose-700 font-semibold rounded-xl border border-rose-200 px-3 py-1.5"
                    >
                      حذف حساب
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
