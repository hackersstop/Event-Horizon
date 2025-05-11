
'use client';

import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut, UserCircle, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppHeader() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  const handleSignOut = async () => {
    await signOut();
  };

  const renderAuthButtons = () => {
    if (loading && !mounted) { 
      return <div className="w-32 h-9 bg-muted rounded-md animate-pulse"></div>;
    }

    if (user) {
      return (
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Link href="/admin/dashboard" legacyBehavior passHref>
              <Button variant="ghost" size="sm" className="text-sm">
                <ShieldCheck className="mr-2 h-4 w-4" /> Admin
              </Button>
            </Link>
          ) : (
            <Link href="/profile" legacyBehavior passHref>
              <Button variant="ghost" size="sm" className="text-sm flex items-center">
                {user.photoURL ? (
                  <Avatar className="mr-2 h-6 w-6">
                    <AvatarImage src={user.photoURL} alt={user.displayName || 'User Avatar'} />
                    <AvatarFallback>
                      {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <UserCircle className="mr-2 h-5 w-5" />
                )}
                Profile
              </Button>
            </Link>
          )}
          <Button onClick={handleSignOut} variant="outline" size="sm" className="text-sm">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      );
    } else {
       if (pathname.startsWith('/admin')) {
        return (
          <Link href="/admin/login" legacyBehavior passHref>
            <Button size="sm" className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
              <LogIn className="mr-2 h-4 w-4" /> Admin Login
            </Button>
          </Link>
        );
      }
      return (
        <Link href="/login" legacyBehavior passHref>
          <Button size="sm" className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
            <LogIn className="mr-2 h-4 w-4" /> Login
          </Button>
        </Link>
      );
    }
  };
  
  const navItems = isAdmin && user ? siteConfig.adminNav : siteConfig.mainNav;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            {siteConfig.name}
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => {
            if (item.protected && !user) return null;
            if (item.admin && (!user || !isAdmin)) return null;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-primary"
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-x-2">
          {mounted && renderAuthButtons()}
          {/* Placeholder for theme toggle if needed in future */}
        </div>
      </div>
    </header>
  );
}
