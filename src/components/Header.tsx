import React, { useState } from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  showAuth?: boolean;
  isAuthenticated?: boolean;
}

export function Header({ showAuth = true, isAuthenticated = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    // Close mobile menu after navigation
    if (isMobile) {
      setIsMobileMenuOpen(false);
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
          <a 
            href="/market-cap-multiplier"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Market Cap
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
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-left text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-left text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                >
                  Access
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-left text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                >
                  How It Works
                </button>
                <a 
                  href="/leverage-calculator"
                  className="text-left text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Calculator
                </a>
                <a 
                  href="/market-cap-multiplier"
                  className="text-left text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Market Cap
                </a>
                
                <div className="pt-4 border-t">
                  {isAuthenticated ? (
                    <Button 
                      onClick={handleSignOut}
                      variant="ghost"
                      size="sm"
                      className="gap-2 w-full justify-start"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  ) : showAuth && (
                    <Button 
                      onClick={() => scrollToSection('pricing')}
                      className="bg-primary hover:bg-primary/90 w-full"
                    >
                      Get Alerts
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
