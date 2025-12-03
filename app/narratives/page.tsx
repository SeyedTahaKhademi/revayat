import Layout from '@/components/Layout';
import StoryCard from '@/components/StoryCard';
import data from '@/data/narratives.json';
import SearchableList from '@/components/SearchableList';

export default function WarNarrativesPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-black text-gray-900">روایات جنگی</h1>
          <p className="text-sm text-gray-600">
            روایت‌هایی از قدرت نظامی ایران در برابر جنایات رژیم غاصب صهیونیستی.
          </p>
        </header>

        <SearchableList items={data as any} linkBase="/narratives" />
      </div>
    </Layout>
  );
}
