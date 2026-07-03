'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/voices', label: 'Voices' },
  { href: '/moods', label: 'Moods' },
  { href: '/letters', label: 'Letters' },
];

export function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-sm border-b border-muted/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-accent">
          💕 Us
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

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </nav>
  );
}
