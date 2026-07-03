'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LettersPage() {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadLetters() {
      const { data } = await supabase
        .from('love_letters')
        .select('*')
        .order('day_number');
      setLetters(data || []);
      setLoading(false);
    }

    loadLetters();
  }, [supabase]);

  if (loading) {
    return <main className="p-8 text-center text-muted">Loading...</main>;
  }

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">💌 30 Reasons Why I Miss You</h1>

      <div className="space-y-4 max-w-2xl">
        {letters.map((letter) => (
          <div
            key={letter.id}
            className="bg-card rounded-xl p-5 border border-muted/10"
          >
            <span className="text-xs font-semibold text-accent">
              Reason #{letter.day_number}
            </span>
            <p className="mt-2 text-white">{letter.reason}</p>
          </div>
        ))}
      </div>

      {letters.length === 0 && (
        <p className="text-center text-muted py-12">No reasons yet.</p>
      )}
    </main>
  );
}
