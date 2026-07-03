'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminPage() {
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Check if admin
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      if (profileData?.role !== 'admin') {
        window.location.href = '/dashboard';
        return;
      }

      // Load settings
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

  async function createPartnerAccount() {
    if (!partnerEmail || !partnerPassword) return;

    const { error } = await supabase.auth.signUp({
      email: partnerEmail,
      password: partnerPassword,
      options: {
        data: {
          display_name: settings?.her_display_name || 'Partner',
        },
      },
    });

    if (!error) {
      setSuccess(`Account created for ${partnerEmail}. Share credentials securely.`);
      setPartnerEmail('');
      setPartnerPassword('');
    } else {
      setSuccess('Error: ' + error.message);
    }
  }

  if (loading) {
    return <main className="p-8 text-center text-muted">Loading...</main>;
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <main className="p-8 text-center text-muted">Access denied. Admin only.</main>
    );
  }

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">🔒 Admin Panel</h1>

      <div className="space-y-6 max-w-2xl">
        {/* Create Partner Account */}
        <div className="bg-card rounded-2xl p-6 border border-muted/10">
          <h2 className="font-semibold mb-4">Create Partner Account</h2>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Partner email"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-background border border-muted/20 text-white"
            />
            <input
              type="password"
              placeholder="Partner password"
              value={partnerPassword}
              onChange={(e) => setPartnerPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-background border border-muted/20 text-white"
            />
            <button
              onClick={createPartnerAccount}
              className="bg-accent px-6 py-2 rounded-lg hover:opacity-90 transition"
            >
              Create Account
            </button>
          </div>
          {success && <p className="text-sm text-green-400 mt-2">{success}</p>}
        </div>

        {/* App Settings */}
        {settings && (
          <div className="bg-card rounded-2xl p-6 border border-muted/10">
            <h2 className="font-semibold mb-4">App Settings</h2>
            <div className="space-y-3 text-sm">
              <p><span className="text-muted">Departure Date:</span> {settings.departure_date}</p>
              <p><span className="text-muted">Together Since:</span> {settings.together_since}</p>
              <p><span className="text-muted">Her Name:</span> {settings.her_display_name}</p>
              <p><span className="text-muted">Your Name:</span> {settings.his_display_name}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
