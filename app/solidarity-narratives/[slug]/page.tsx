import Layout from '@/components/Layout';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

type SolidarityNarrative = {
  slug: string;
  title: string;
  description: string;
  image: string;
  tag: string;
  content: string[];
};

async function loadSolidarityData(): Promise<SolidarityNarrative[]> {
  const cwd = process.cwd();
  const file = path.join(cwd, 'data', 'solidarity_narratives.json');
  console.log('[SOLI] cwd=', cwd, ' file=', file);
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw) as SolidarityNarrative[];
}

export default async function SolidarityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadSolidarityData();
  console.log('[SOLI] params.slug=', slug, ' slugs=', data.map((item) => item.slug));
  const item = data.find((entry) => entry.slug === slug) ?? notFound();
  console.log('[SOLI] item found?', !!item);

  return (
    <Layout>
      <article className="space-y-6">
        <header className="text-center space-y-3">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">{item.title}</h1>
          <p className="text-sm text-gray-600">{item.description}</p>
        </header>

        <div className="overflow-hidden rounded-[24px] border bg-white">
          <div className="relative h-64 w-full md:h-80">
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority={false}
              className="object-cover"
              sizes="(min-width: 768px) 60vw, 90vw"
              unoptimized={item.image.startsWith('https://')}
            />
          </div>
        </div>

        <section className="prose prose-p:leading-8 max-w-none text-gray-800">
          {item.content.map((p: string, idx: number) => (
            <p key={idx} className="text-base">{p}</p>
          ))}
        </section>
      </article>
    </Layout>
  );
}

// Dynamic route; no static params
