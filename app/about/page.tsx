import Layout from '@/components/Layout';

export default function AboutPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="section-title">درباره ما</h1>

        <section className="rounded-2xl border p-4 bg-white/70 space-y-3">
          <h2 className="font-bold text-gray-900">چرا ساخت این برنامه سخت بود؟</h2>
          <p className="text-sm text-gray-700">
            مسیر ساخت این وب‌اپلیکیشن پر از چالش‌های فنی و طراحی بود؛ از طراحی مینیمال و راست‌به‌چپ گرفته تا
            بهینه‌سازی عملکرد روی موبایل، هماهنگی حالت تیره/روشن، مدیریت تصاویر خارجی، و یکپارچه‌سازی داده‌ها برای
            جستجو و ناوبری سریع. هدف ما این بود که روایت مقاومت مردم در جنگ ۱۲ روزه را هم زیبا و هم قابل‌دسترس ارائه کنیم.
          </p>
          <ul className="list-disc pr-6 text-sm text-gray-700 space-y-1">
            <li>بهینه‌سازی تجربه موبایل و حذف افکت‌های سنگین در دستگاه‌های ضعیف</li>
            <li>هماهنگ‌سازی تم روشن/تاریک با سیستم و حفظ خوانایی اجزا</li>
            <li>پشتیبانی از تصاویر خارجی و داده‌های متنی/تصویری متنوع</li>
            <li>طراحی ناوبری ساده و جستجوی سریع با داده‌های ساختاریافته</li>
          </ul>
        </section>

        <section className="rounded-2xl border p-4 bg-white/70 space-y-3">
          <h2 className="font-bold text-gray-900">تیم سازنده</h2>
          <p className="text-sm text-gray-700">
            این پروژه به‌دست تیم «شهید طهرانی مقدم» توسعه داده شده است. ما تلاش کرده‌ایم تا با ترکیب روایت‌گری و
            فناوری، بازتابی شایسته از مقاومت مردم ایران در جنگ ۱۲ روزه ارائه دهیم.
          </p>
        </section>
      </div>
        <section className="rounded-2xl border p-4 bg-white/70 space-y-3">
          <h2 className="font-bold text-gray-900">حمایت از بازی ایرانی</h2>
          <a
            href="https://urizin.itch.io/shabikhoon"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl px-4 py-2 border bg-white/70 font-semibold"
          >
            حمایت از بازی ایرانی
          </a>
          <p className="text-sm text-gray-700">
            می‌توانید همین الان یک بازی مرتبط با جنگ ۱۲ روزه را انجام دهید. لینک: urizin.itch.io/shabikhoon
          </p>
        </section>
    </Layout>
  );
}
