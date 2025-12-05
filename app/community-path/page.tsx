'use client';

import Layout from '@/components/Layout';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const steps = [
  {
    title: 'گام ۱: ایده‌ پردازی و انتخاب موضوع',
    body: 'موضوع روایت یا گزارش خود را انتخاب کنید. می‌تواند تجربه شخصی، دیالوگ خیابانی، یا مستندسازی تصویری باشد. چند کلمه کلیدی و هدف روایت را مشخص کنید.',
  },
  {
    title: 'گام ۲: جمع‌آوری شواهد و مدیا',
    body: 'تصاویر، صوت یا ویدیو را آپلود کنید (در صفحه اکسپلور با همان فرم انتشار). لینک‌ها یا فایل‌های حجیم را می‌توانید داخل فایل متنی کوتاه (doc/pdf) خلاصه کنید.',
  },
  {
    title: 'گام ۳: تکمیل فرم مشارکت',
    body: 'فرم زیر را پر کنید. اطلاعات تماس، توضیح روایت و اینکه انتظار چه بازخوردی دارید را بنویسید. بعد از ارسال، تیم روایت، داده‌ها را بررسی و منتشر می‌کند.',
  },
  {
    title: 'گام ۴: دنبال‌ کردن وضعیت',
    body: 'پس از ثبت، یک شناسه رهگیری دریافت می‌کنید. از طریق داشبورد پروفایل خود یا پشتیبانی می‌توانید از وضعیت انتشار مطلع شوید و به سؤالات پاسخ دهید.',
  },
];

const resources = [
  {
    title: 'راهنمای تولید محتوای روایی',
    description: 'اصول داستان‌گویی، تدوین تصویری و تنظیم روایت برای نشر عمومی.',
    href: '/documents/narrative-guide.pdf',
  },
  {
    title: 'فرم استاندارد جمع‌آوری شواهد',
    description: 'چک‌لیست مصاحبه، ثبت متادیتای فایل‌ها و قالب پیشنهادی ضمیمه‌ها.',
    href: '/documents/evidence-template.docx',
  },
  {
    title: 'نکات حقوقی و امنیتی',
    description: 'توصیه‌های مربوط به رضایت آگاهانه، حریم خصوصی و امنیت دیجیتال.',
    href: '/documents/legal-safety.pdf',
  },
];

export default function CommunityPathPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    subject: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const disabled = useMemo(
    () =>
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.subject.trim() ||
      form.description.trim().length < 20,
    [form]
  );

  const handleChange = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return (
    <Layout>
      <div className="space-y-10">
        <section className="rounded-3xl bg-gradient-to-br from-teal-500 to-blue-600 text-white px-6 py-10 text-center shadow-2xl space-y-4">
          <p className="text-xs uppercase tracking-[0.45em] text-white/70">Community Path</p>
          <h1 className="text-3xl md:text-4xl font-black">مسیر مشارکت اجتماعی روایت</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            این بخش برای فعالان محلی و داوطلبانی طراحی شده که می‌خواهند روایت‌ها و مستندهای خود را با جامعه روایت به اشتراک بگذارند.
            با دنبال کردن گام‌های زیر، داده‌هایتان در هاست مخصوص ذخیره و در صفحه اکسپلور نمایش داده می‌شود.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2" aria-label="recorded-steps">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-rose-50">
              <h2 className="font-extrabold text-lg text-rose-600">{step.title}</h2>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-dashed border-slate-200 bg-white/90 p-6 shadow-sm space-y-4">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black text-gray-900">فرم ارسال مشارکت</h2>
          </div>
          {submitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm">
              با تشکر! درخواست شما ثبت شد. شناسه پیگیری: <strong>{Math.random().toString(36).slice(2, 8).toUpperCase()}</strong>
            </div>
          ) : (
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (disabled) return;
                setSubmitted(true);
              }}
            >
              <label className="text-sm font-semibold text-gray-700">
                نام و نام خانوادگی
                <input
                  type="text"
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-rose-400 focus:outline-none"
                  required
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                ایمیل یا راه ارتباطی
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-rose-400 focus:outline-none"
                  required
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                عنوان روایت / موضوع مشارکت
                <input
                  type="text"
                  value={form.subject}
                  onChange={handleChange('subject')}
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-rose-400 focus:outline-none"
                  required
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                توضیحات تکمیلی
                <textarea
                  value={form.description}
                  onChange={handleChange('description')}
                  rows={5}
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-rose-400 focus:outline-none"
                  placeholder="خلاصه روایت، نوع مدیا، لینک‌ها و درخواست پشتیبانی خود را بنویسید..."
                  required
                />
              </label>
              <button
                type="submit"
                disabled={disabled}
                className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ثبت مسیر مشارکت
              </button>
            </form>
          )}
        </section>

        <section className="rounded-3xl bg-gray-900 text-white p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black">منابع پیشنهادی</h2>
            <p className="text-sm text-white/70">
              فایل‌های آموزشی و نمونه مستندات که قبل از ارسال روایت می‌توانید دانلود و مرور کنید.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {resources.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/15 bg-white/5 p-4 space-y-2">
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed">{item.description}</p>
                </div>
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                >
                  دانلود منبع
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
