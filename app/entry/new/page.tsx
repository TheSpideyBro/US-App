'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { EntryForm } from '@/components/entries/EntryForm';

export default function NewEntryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [dayNumber, setDayNumber] = useState(1);
  const [herName, setHerName] = useState('her');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Get departure date from settings
      const { data: settings } = await supabase
        .from('app_settings')
        .select('departure_date, her_display_name')
        .eq('id', 1)
        .single();

      if (settings?.departure_date) {
        const depart = new Date(settings.departure_date).getTime();
        const now = new Date().getTime();
        setDayNumber(Math.max(1, Math.floor((now - depart) / (1000 * 60 * 60 * 24)) + 1));
      }

      if (settings?.her_display_name) {
        setHerName(settings.her_display_name);
      }

      setLoading(false);
    }

    loadData();
  }, [supabase]);

  function handleSuccess() {
    router.push('/timeline');
  }

  if (loading) {
    return <main className="p-8 text-center text-muted">Loading...</main>;
  }

  return (
    <main className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">✍️ New Entry</h1>
      <EntryForm dayNumber={dayNumber} herName={herName} onSuccess={handleSuccess} />
    </main>
  );
}
