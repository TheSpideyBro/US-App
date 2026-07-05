'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Heart, Plus, Calendar } from 'lucide-react';

interface Anniversary {
  id: string;
  title: string;
  date: string;
  description: string;
  created_at: string;
}

export default function AnniversariesPage() {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('anniversaries')
        .select('*')
        .order('date', { ascending: true });
      setAnniversaries(data || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleAdd() {
    if (!title || !date) return;
    setAdding(true);
    await supabase.from('anniversaries').insert({
      title,
      date,
      description,
      created_by: (await supabase.auth.getUser()).data.user?.id || '',
    });
    setTitle('');
    setDate('');
    setDescription('');
    const { data } = await supabase
      .from('anniversaries')
      .select('*')
      .order('date', { ascending: true });
    setAnniversaries(data || []);
    setAdding(false);
  }

  function daysUntil(dateStr: string): number {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  }

  if (loading) return <main className="p-8 text-center text-muted">Loading...</main>;

  return (
    <main className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-2">💝 Special Dates</h1>
      <p className="text-muted mb-8">Anniversaries and special moments you share together.</p>

      {/* Add Form */}
      <div className="bg-card rounded-2xl p-5 border border-white/10 mb-8">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-accent" /> Add a Special Date
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g., First Date)"
            className="px-4 py-2.5 rounded-xl bg-background border border-white/10 text-white placeholder-muted/40 focus:outline-none focus:border-accent transition text-sm"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-accent transition text-sm"
          />
          <button
            onClick={handleAdd}
            disabled={!title || !date || adding}
            className="bg-accent hover:bg-accent-hover px-4 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 text-sm"
          >
            {adding ? 'Adding...' : 'Add Date'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {anniversaries.map((a) => {
          const days = daysUntil(a.date);
          const isUpcoming = days > 0;
          const isToday = days === 0;
          const isPast = days < 0;

          return (
            <div key={a.id} className="bg-card rounded-xl p-4 border border-white/5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isToday ? 'bg-accent/20 text-accent' : isUpcoming ? 'bg-purple-500/20 text-purple-400' : 'bg-muted/10 text-muted'
              }`}>
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{a.title}</h3>
                <p className="text-muted text-xs">{new Date(a.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                {a.description && <p className="text-xs text-muted/60 mt-0.5">{a.description}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                {isToday ? (
                  <span className="text-accent text-xs font-bold bg-accent/10 px-3 py-1 rounded-full">Today! 💕</span>
                ) : isUpcoming ? (
                  <span className="text-xs text-muted bg-white/5 px-3 py-1 rounded-full">{days} days</span>
                ) : (
                  <span className="text-xs text-muted/40 bg-white/5 px-3 py-1 rounded-full">Passed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {anniversaries.length === 0 && (
        <p className="text-center text-muted py-12">No special dates yet. Add your first one!</p>
      )}
    </main>
  );
}
