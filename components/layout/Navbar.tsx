'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Menu, X, LogOut, Plus, MessageCircle, Heart, Calendar } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: null },
  { href: '/timeline', label: 'Timeline', icon: null },
  { href: '/gallery', label: 'Gallery', icon: null },
  { href: '/voices', label: 'Voices', icon: null },
  { href: '/moods', label: 'Moods', icon: null },
  { href: '/letters', label: 'Letters', icon: null },
  { href: '/album', label: 'Album', icon: <Heart className="w-3.5 h-3.5" /> },
  { href: '/anniversaries', label: 'Dates', icon: <Calendar className="w-3.5 h-3.5" /> },
  { href: '/chat', label: 'Chat', icon: <MessageCircle className="w-3.5 h-3.5" /> },
  { href: '/export', label: 'Export', icon: null },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();
        setUserName(profile?.display_name || user.email?.split('@')[0] || '');
      }

      setLoading(false);
    }
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      if (session?.user) {
        setUserName(session.user.email?.split('@')[0] || '');
      } else {
        setUserName('');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  if (loading) return null;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2">
            <span className="text-2xl animate-heartbeat">💕</span>
            <span className="text-xl font-bold text-accent">Us</span>
          </Link>

          {/* Desktop Nav — only show if logged in */}
          {isLoggedIn && (
            <div className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.href
                      ? 'bg-accent/15 text-accent'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Tablet Nav (icons only) */}
          {isLoggedIn && (
            <div className="hidden xl:flex items-center gap-2">
              <Link href="/entry/new">
                <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  New Entry
                </Button>
              </Link>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn && userName && (
              <span className="hidden sm:block text-xs text-muted">
                Hi, {userName} 👋
              </span>
            )}
            {isLoggedIn && (
              <>
                <Link href="/entry/new">
                  <button className="sm:hidden bg-accent hover:bg-accent-hover w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105">
                    <Plus className="w-5 h-5" />
                  </button>
                </Link>
                <button
                  className="md:hidden text-white p-2"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:flex">
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </>
            )}
            {!isLoggedIn && (
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav — only show if logged in */}
      {isLoggedIn && mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-card/95 backdrop-blur-md animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === item.href
                    ? 'bg-accent/15 text-accent'
                    : 'text-muted hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <Link href="/entry/new" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" className="w-full mt-2">
                <Plus className="w-4 h-4 mr-1.5" />
                New Entry
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="w-full mt-2">
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
