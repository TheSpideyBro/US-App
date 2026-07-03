'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import jsPDF from 'jspdf';

export default function ExportPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('entries')
        .select('*')
        .order('created_at');
      setEntries(data || []);

      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();
      setSettings(settingsData);

      setLoading(false);
    }

    loadData();
  }, [supabase]);

  async function generatePDF() {
    setGenerating(true);
    const doc = new jsPDF();

    doc.setFontSize(24);
    doc.setTextColor(233, 30, 99);
    doc.text('Us — Our Love Journal', 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Departure Date: ${settings?.departure_date || 'N/A'}`, 20, 35);
    doc.text(`Total Entries: ${entries.length}`, 20, 42);

    let y = 55;
    entries.forEach((entry, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);
      doc.setTextColor(233, 30, 99);
      doc.text(`Day ${entry.day_number} — ${new Date(entry.created_at).toLocaleDateString()}`, 20, y);
      y += 7;

      doc.setTextColor(200);
      doc.text(`${entry.mood_emoji} ${entry.mood.toUpperCase()}`, 20, y);
      y += 7;

      doc.setTextColor(255);
      const lines = doc.splitTextToSize(entry.text, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 5;
    });

    doc.save('us-love-journal.pdf');
    setGenerating(false);
  }

  if (loading) {
    return <main className="p-8 text-center text-muted">Loading...</main>;
  }

  return (
    <main className="p-4 md:p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">📄 Export as PDF</h1>
      <p className="text-muted mb-6">Generate a beautiful printable booklet of your journey.</p>
      <button
        onClick={generatePDF}
        disabled={generating || entries.length === 0}
        className="bg-accent px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
      >
        {generating ? 'Generating...' : 'Download PDF'}
      </button>
    </main>
  );
}
