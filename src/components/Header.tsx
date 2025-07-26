import React from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Menu, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  showAuth?: boolean;
  isAuthenticated?: boolean;
}

export function Header({ showAuth = true, isAuthenticated = false }: HeaderProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear all auth state from storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage || {}).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });

      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });

      // Force a page reload to clear all state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between max-w-7xl px-4">
        <Logo size="sm" />
        
        <nav className="hidden md:flex items-center justify-center space-x-6 flex-1">
          <button 
            onClick={() => scrollToSection('features')}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('pricing')}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Access
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            How It Works
          </button>
          <a 
            href="/leverage-calculator"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Calculator
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <Button 
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : showAuth && (
            <Button 
              onClick={() => scrollToSection('pricing')}
              className="bg-primary hover:bg-primary/90"
            >
              Get Alerts
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
