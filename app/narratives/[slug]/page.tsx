import Layout from '@/components/Layout';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

type Narrative = {
  slug: string;
  title: string;
  description: string;
  image: string;
  tag: string;
  content: string[];
};

async function loadNarratives(): Promise<Narrative[]> {
  const file = path.join(process.cwd(), 'data', 'narratives.json');
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw) as Narrative[];
}

export default async function NarrativeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadNarratives();
  const item = data.find((narrative) => narrative.slug === slug) ?? notFound();

  const normalizeSrc = (src: string) => {
    let s = (src || '').trim();
    const secondData = s.indexOf('data:image', 5);
    if (secondData > 0) s = s.slice(0, secondData);
    const badAttr = s.indexOf("' width=");
    if (badAttr > 0) s = s.slice(0, badAttr);
    return s;
  };

  const safeImage = normalizeSrc(item.image);
  const unoptimized =
    typeof safeImage === 'string' &&
    (safeImage.startsWith('https://') || safeImage.startsWith('http://') || safeImage.startsWith('data:'));

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
              src={safeImage}
              alt={item.title}
              fill
              priority={false}
              className="object-cover"
              sizes="(min-width: 768px) 60vw, 90vw"
              unoptimized={unoptimized}
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

// Dynamic route; no static params needed
