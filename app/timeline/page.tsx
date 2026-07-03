'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EntryCard } from '@/components/entries/EntryCard';

export default function TimelinePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: entriesData } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });
      setEntries(entriesData || []);

      // Fetch all profile display names
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name');
      const nameMap: Record<string, string> = {};
      profilesData?.forEach((p: any) => {
        nameMap[p.id] = p.display_name || 'Unknown';
      });
      setProfiles(nameMap);

      setLoading(false);
    }

    loadData();
  }, [supabase]);

  if (loading) {
    return <main className="p-8 text-center text-muted">Loading...</main>;
  }

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Timeline</h1>
      <div className="space-y-4">
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            displayName={profiles[entry.user_id] || 'Unknown'}
          />
        ))}
        {entries.length === 0 && (
          <p className="text-center text-muted py-12">No entries yet.</p>
        )}
      </div>
    </main>
  );
}
