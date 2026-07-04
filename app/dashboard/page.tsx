'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LoveCounter } from '@/components/dashboard/LoveCounter';
import { TogetherCounter } from '@/components/dashboard/TogetherCounter';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { RecentEntries } from '@/components/dashboard/RecentEntries';

export default function DashboardPage() {
  const [settings, setSettings] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      // Fetch app settings
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();
      setSettings(settingsData);

      // Fetch recent entries
      const { data: entriesData } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      setEntries(entriesData || []);

      setLoading(false);
    }

    loadData();
  }, [supabase]);

  if (loading) {
    return (
      <main className="p-8 text-center text-muted">Loading...</main>
    );
  }

  if (!settings) {
    return (
      <main className="p-8 text-center text-muted">
        No settings found. Contact admin.
      </main>
    );
  }

  return (
    <main className="p-4 md:p-8 space-y-6">
      <LoveCounter
        departureDate={settings.departure_date}
        herName={settings.her_display_name || 'Her'}
      />

      <TogetherCounter togetherSince={settings.together_since} />

      <QuickStats
        entryCount={entries.length}
        photoCount={entries.filter((e) => e.photo_url).length}
        voiceCount={entries.filter((e) => e.voice_url).length}
      />

      <div className="flex flex-col items-center gap-4">
        <RecentEntries entries={entries} />
        <a href="/entry/new">
          <button className="bg-accent px-8 py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition shadow-lg shadow-accent/20">
            ✍️ Write a New Entry
          </button>
        </a>
      </div>
    </main>
  );
}
