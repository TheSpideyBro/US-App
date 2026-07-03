'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MOOD_VALUES: Record<string, number> = {
  sad: 1,
  missing: 2,
  loving: 3,
  happy: 4,
  'in-love': 5,
};

const MOOD_LABELS: Record<string, string> = {
  1: '😢 Sad',
  2: '😔 Missing',
  3: '❤️ Loving',
  4: '😊 Happy',
  5: '😍 In Love',
};

export default function MoodsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadMoods() {
      const { data: entries } = await supabase
        .from('entries')
        .select('mood, created_at, user_id')
        .order('created_at');

      const chartData = (entries || []).map((e: any) => ({
        day: new Date(e.created_at).toLocaleDateString(),
        value: MOOD_VALUES[e.mood] || 1,
        moodLabel: MOOD_LABELS[MOOD_VALUES[e.mood] || 1],
      }));

      setData(chartData);
      setLoading(false);
    }

    loadMoods();
  }, [supabase]);

  if (loading) {
    return <main className="p-8 text-center text-muted">Loading...</main>;
  }

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Mood Timeline</h1>

      <div className="bg-card rounded-2xl p-6 border border-muted/10">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#b0b0c0' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(v) => MOOD_LABELS[v] || ''}
              tick={{ fontSize: 12, fill: '#b0b0c0' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number) => [MOOD_LABELS[value] || '', 'Mood']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#e91e63"
              strokeWidth={2}
              dot={{ fill: '#e91e63', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
