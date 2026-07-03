'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { EntryForm } from '@/components/entries/EntryForm';

export default function NewEntryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [departureDate, setDepartureDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  function getDayNumber(departure: string): number {
    const depart = new Date(departure).getTime();
    const now = new Date().getTime();
    return Math.max(1, Math.floor((now - depart) / (1000 * 60 * 60 * 24)) + 1);
  }

  function handleSuccess() {
    router.push('/timeline');
  }

  if (loading) {
    return <main className="p-8 text-center text-muted">Loading...</main>;
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">New Entry</h1>
      <EntryForm dayNumber={getDayNumber(departureDate)} onSuccess={handleSuccess} />
    </main>
  );
}
