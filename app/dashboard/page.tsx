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
      const { data: settingsData, error: settingsError } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();

      console.log('Settings data:', settingsData);
      console.log('Settings error:', settingsError);

      setSettings(settingsData);

      // Fetch recent entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      console.log('Entries data:', entriesData);
      console.log('Entries error:', entriesError);

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
        <p>No settings found. Contact admin.</p>
        <details className="mt-4 text-left max-w-md mx-auto">
          <summary className="cursor-pointer text-accent">Debug info (click to expand)</summary>
          <pre className="mt-2 p-3 bg-background rounded text-xs overflow-auto whitespace-pre-wrap">
            {JSON.stringify({
              settingsData: settings,
              entriesCount: entries.length,
            }, null, 2)}
          </pre>
        </details>
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
        entryCount={30}
        photoCount={12}
        voiceCount={5}
      />

      <RecentEntries entries={entries} />
    </main>
  );
}
