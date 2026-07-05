'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function AdminPage() {
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
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
    setError('');
    setSuccess('');

    if (!partnerEmail || !partnerPassword) {
      setError('Please fill in both email and password.');
      return;
    }

    if (partnerPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setCreating(true);

    // Re-verify admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated.');
      setCreating(false);
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileData?.role !== 'admin') {
      setError('Access denied. Admin only.');
      setCreating(false);
      return;
    }

    // Use signUp instead of admin.createUser (anon key can't use admin API)
    const { error: signUpError } = await supabase.auth.signUp({
      email: partnerEmail,
      password: partnerPassword,
      options: {
        data: {
          display_name: settings?.her_display_name || 'Partner',
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setCreating(false);

    if (signUpError) {
      // If email already exists, that's fine — user already has an account
      if (signUpError.message.includes('already registered')) {
        setSuccess(`User ${partnerEmail} already exists. You can share the password with them.`);
      } else {
        setError(signUpError.message);
      }
    } else {
      // Now update the role to 'partner' since signUp creates with default role
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      // We can't easily find the user by email from client side, so we set role via a direct approach
      // Actually, the handle_new_user trigger sets role to 'partner' automatically
      setSuccess(`Account created for ${partnerEmail}! Share the credentials securely.`);
      setPartnerEmail('');
      setPartnerPassword('');
    }
  }

  if (loading) {
    return <main className="p-8 text-center text-muted">Loading...</main>;
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <main className="p-8 text-center text-muted">
        Access denied. Admin only.
      </main>
    );
  }

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">🔒 Admin Panel</h1>

      <div className="space-y-6 max-w-2xl">
        {/* Create Partner Account */}
        <div className="bg-card rounded-2xl p-6 border border-white/10">
          <h2 className="font-semibold mb-2">Create Partner Account</h2>
          <p className="text-xs text-muted mb-4">
            Enter your partner&apos;s email and a password. They can log in immediately.
          </p>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Partner email"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-white/10 text-white placeholder-muted/40 focus:outline-none focus:border-accent transition text-sm"
            />
            <input
              type="password"
              placeholder="Partner password (min 6 chars)"
              value={partnerPassword}
              onChange={(e) => setPartnerPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-white/10 text-white placeholder-muted/40 focus:outline-none focus:border-accent transition text-sm"
            />
            <Button
              onClick={createPartnerAccount}
              disabled={creating}
              className="w-full"
            >
              {creating ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
          {success && (
            <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-sm text-green-400">
              {success}
            </div>
          )}
          {error && (
            <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* App Settings */}
        {settings && (
          <div className="bg-card rounded-2xl p-6 border border-white/10">
            <h2 className="font-semibold mb-4">App Settings</h2>
            <div className="space-y-3 text-sm">
              <p><span className="text-muted">Departure Date:</span> {settings.departure_date}</p>
              <p><span className="text-muted">Together Since:</span> {settings.together_since}</p>
              <p><span className="text-muted">Her Name:</span> {settings.her_display_name}</p>
              <p><span className="text-muted">Your Name:</span> {settings.his_display_name}</p>
            </div>
          </div>
        )}

        {/* Alternative: Manual account creation instructions */}
        <div className="bg-card rounded-2xl p-6 border border-white/10">
          <h2 className="font-semibold mb-3">⚠️ If account creation fails</h2>
          <p className="text-sm text-muted mb-3">
            You can also create the account manually in Supabase:
          </p>
          <ol className="text-sm text-muted list-decimal list-inside space-y-1">
            <li>Go to Supabase Dashboard → Authentication → Users</li>
            <li>Click &quot;Add user&quot;</li>
            <li>Enter her email and password</li>
            <li>Go to SQL Editor and run: <code className="bg-background px-1.5 py-0.5 rounded text-xs">UPDATE profiles SET role = &apos;partner&apos; WHERE email = &apos;her@email.com&apos;;</code></li>
          </ol>
        </div>
      </div>
    </main>
  );
}
