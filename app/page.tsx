'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      }
    }
    checkAuth();
  }, [router, supabase]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">💕 Us</h1>
      <p className="text-muted mb-8">A love journal for when we are apart.</p>
      <Link href="/login" className="bg-accent px-6 py-3 rounded-lg hover:opacity-90 transition">
        Log In
      </Link>
    </main>
  );
}
