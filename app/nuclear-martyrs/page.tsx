import Layout from '@/components/Layout';
import StoryCard from '@/components/StoryCard';
import data from '@/data/nuclear_martyrs.json';
import SearchableList from '@/components/SearchableList';

export default function NuclearMartyrsPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-black text-gray-900">شهدای جنگ 12 روزه</h1>
          <p className="text-sm text-gray-600">
            زندگی‌نامه شهدای معروف که در دفاع مقدس ۱۲ روزه آسمانی شدند.
          </p>
        </header>

        <SearchableList
          items={data.map((m: any) => ({
            slug: m.slug,
            title: m.name,
            description: m.shortDescription,
            image: m.image,
            tag: 'شهید',
          })) as any}
          linkBase="/nuclear-martyrs"
        />
      </div>
    </Layout>
  );
}
