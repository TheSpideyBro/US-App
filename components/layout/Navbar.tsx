'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/voices', label: 'Voices' },
  { href: '/moods', label: 'Moods' },
  { href: '/letters', label: 'Letters' },
  { href: '/export', label: 'Export' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-sm border-b border-muted/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-accent">
          {'💕'} Us
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition ${
                pathname === item.href
                  ? 'text-accent font-semibold'
                  : 'text-muted hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/entry/new">
            <Button variant="primary" size="sm">
              ✍️ New Entry
            </Button>
          </Link>
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden animate-fade-in px-4 pb-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block py-2 text-sm transition ${
                pathname === item.href
                  ? 'text-accent font-semibold'
                  : 'text-muted hover:text-white'
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/entry/new" onClick={() => setMobileOpen(false)}>
            <Button variant="primary" size="sm" className="w-full mt-2">
              ✍️ New Entry
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
