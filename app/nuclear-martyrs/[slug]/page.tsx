import Layout from '@/components/Layout';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

type NuclearMartyr = {
  slug: string;
  name: string;
  image: string;
  shortDescription: string;
  biography: string;
  resistanceLesson: string;
  quote: string;
  gallery?: string[];
  images?: string[];
};

async function loadMartyrs(): Promise<NuclearMartyr[]> {
  const file = path.join(process.cwd(), 'data', 'nuclear_martyrs.json');
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw) as NuclearMartyr[];
}

export default async function MartyrBioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadMartyrs();
  const martyr = data.find((entry) => entry.slug === slug) ?? notFound();
  const isDataImage = martyr.image.startsWith('data:');
  const gallery = martyr.gallery && Array.isArray(martyr.gallery) ? martyr.gallery.filter(Boolean) : [];

  return (
    <Layout>
      <article className="space-y-6">
        <header className="text-center space-y-3">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">{martyr.name}</h1>
          <p className="text-sm text-gray-600">{martyr.shortDescription}</p>
        </header>

        <div className="overflow-hidden rounded-[24px] border bg-white">
          <div className="relative h-64 w-full md:h-80">
            <Image
              src={martyr.image}
              alt={martyr.name}
              fill
              priority={true}
              className="object-cover"
              sizes="(min-width: 768px) 60vw, 90vw"
              unoptimized={isDataImage || martyr.image.startsWith('https://')}
            />
          </div>
        </div>

        <section className="space-y-4">
          <div className="prose prose-p:leading-8 max-w-none text-gray-800">
            <p className="text-base">{martyr.biography}</p>
          </div>
          
          <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
            <h3 className="font-bold text-blue-900 mb-2">درس مقاومت</h3>
            <p className="text-sm text-blue-800">{martyr.resistanceLesson}</p>
          </div>
          
          <div className="bg-amber-50 border-r-4 border-amber-500 p-4 rounded">
            <p className="text-base font-semibold text-amber-900 italic">{martyr.quote}</p>
          </div>
        </section>

        {gallery.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">گالری تصاویر</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((src, idx) => {
                const unopt = typeof src === 'string' && (src.startsWith('data:') || src.startsWith('https://'));
                return (
                  <div key={idx} className="relative h-36 w-full overflow-hidden rounded-xl border">
                    <Image
                      src={src}
                      alt={`${martyr.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 30vw, 45vw"
                      unoptimized={unopt}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </Layout>
  );
}

// Dynamic route; no static params
