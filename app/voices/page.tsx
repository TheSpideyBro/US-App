'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function VoicesPage() {
  const [voices, setVoices] = useState<{ url: string; day: number; date: string }[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadVoices() {
      const { data } = await supabase
        .from('entries')
        .select('voice_url, day_number, created_at')
        .not('voice_url', 'is', null)
        .order('created_at', { ascending: false });

      const mapped = (data || []).map((e: any) => ({
        url: e.voice_url,
        day: e.day_number,
        date: new Date(e.created_at).toLocaleDateString(),
      }));
      setVoices(mapped);
      setLoading(false);
    }

    loadVoices();
  }, [supabase]);

  function togglePlay(url: string) {
    setPlaying(playing === url ? null : url);
  }

  if (loading) {
    return <main className="p-8 text-center text-muted">Loading...</main>;
  }

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Voice Messages</h1>

      <div className="space-y-3 max-w-2xl">
        {voices.map((v, i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-4 border border-muted/10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-accent">Day {v.day}</span>
              <span className="text-xs text-muted">{v.date}</span>
            </div>
            <audio
              src={v.url}
              controls
              className="w-full"
              onPlay={() => {
                if (playing && playing !== v.url) {
                  // Pause previous
                }
              }}
            />
          </div>
        ))}
      </div>

      {voices.length === 0 && (
        <p className="text-center text-muted py-12">No voice notes yet.</p>
      )}
    </main>
  );
}
