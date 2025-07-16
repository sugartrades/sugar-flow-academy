import React from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface HeaderProps {
  showAuth?: boolean;
}

export function Header({ showAuth = true }: HeaderProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
            Pricing
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            How It Works
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {showAuth && (
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
