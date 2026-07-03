'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Verify admin role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileData?.role !== 'admin') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      const { data } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();
      setSettings(data);
      setLoading(false);
    }

    loadSettings();
  }, [supabase]);

  async function saveSettings() {
    if (!settings) return;
    const { error } = await supabase
      .from('app_settings')
      .update({
        departure_date: settings.departure_date,
        together_since: settings.together_since,
        her_display_name: settings.her_display_name,
        his_display_name: settings.his_display_name,
      })
      .eq('id', 1);

    if (!error) setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return <main className="p-8 text-center text-muted">Loading...</main>;
  }

  if (!isAdmin) {
    return (
      <main className="p-8 text-center text-muted">
        Settings are admin-only.{' '}
        <a href="/admin" className="text-accent underline">
          Go to Admin Panel
        </a>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">⚙️ Settings</h1>

      <div className="bg-card rounded-2xl p-6 border border-muted/10 max-w-xl space-y-4">
        <div>
          <label className="block text-sm text-muted mb-1">Departure Date</label>
          <input
            type="date"
            value={settings.departure_date}
            onChange={(e) => setSettings({ ...settings, departure_date: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-muted/20 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Together Since</label>
          <input
            type="date"
            value={settings.together_since}
            onChange={(e) => setSettings({ ...settings, together_since: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-muted/20 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Her Display Name</label>
          <input
            type="text"
            value={settings.her_display_name}
            onChange={(e) => setSettings({ ...settings, her_display_name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-muted/20 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Your Display Name</label>
          <input
            type="text"
            value={settings.his_display_name}
            onChange={(e) => setSettings({ ...settings, his_display_name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-muted/20 text-white"
          />
        </div>

        <button
          onClick={saveSettings}
          className="bg-accent px-6 py-2.5 rounded-lg hover:opacity-90 transition w-full"
        >
          {saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>
    </main>
  );
}
