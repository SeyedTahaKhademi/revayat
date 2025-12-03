import Layout from '@/components/Layout';
import data from '@/data/documents.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';

interface DocumentDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { slug } = await params;
  const item = data.find((doc) => doc.slug === slug);

  if (!item) {
    notFound();
  }

  return (
    <Layout>
      <article className="space-y-8">
        <header className="space-y-3 text-center">
          <span className="text-xs font-semibold text-rose-600">{item.category}</span>
          <h1 className="text-3xl font-black text-gray-900">{item.title}</h1>
          <p className="text-sm text-gray-600">
            روایتی از مقاومت و ایثار در جنگ ۱۲ روزه. این مستند شامل اسناد، تصاویر و شهادت‌های مرتبط است.
          </p>
        </header>

        <div className="overflow-hidden rounded-[32px] border border-white/50 shadow-xl">
          <div className="relative h-72 w-full">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 60vw, 90vw"
              priority={false}
              unoptimized={item.image.startsWith('https://')}
            />
          </div>
        </div>

        <section className="space-y-4 text-gray-700">
          <p>
            این مستند بخشی از آرشیو جامع روایت‌های مقاومت و ایثار در جنگ ۱۲ روزه است. هر سند شامل اطلاعات تفصیلی، تصاویر تاریخی و شهادت‌های مرتبط است.
          </p>
          <p>
            می‌توانید از طریق دسته‌بندی‌های مختلف (نبردهای موشکی، گزارش‌های تصویری، تحلیل‌ها و غیره) به سایر مستندات دسترسی پیدا کنید.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
          <span className="rounded-full bg-gray-100 px-3 py-1">#مستندات</span>
          <span className="rounded-full bg-gray-100 px-3 py-1">#{item.category}</span>
          <span className="rounded-full bg-gray-100 px-3 py-1">#۱۲روز_مقاومت</span>
        </div>

        <div className="text-center">
          <Link
            href="/documents"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
          >
            بازگشت به مستندات
          </Link>
        </div>
      </article>
    </Layout>
  );
}
