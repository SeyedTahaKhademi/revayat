'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Layout from '@/components/Layout';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return (
    <Layout>
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        در حال انتقال به پروفایل برای ورود یا ساخت حساب...
      </div>
    </Layout>
  );
}
