
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';
import { XRPMarketDataPanel } from '@/components/calculator/XRPMarketDataPanel';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Landing() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={isAuthenticated} />
      <HeroSection />
      
      {/* XRP Live Price Section */}
      <section className="container py-12">
        <div className="max-w-2xl mx-auto">
          <XRPMarketDataPanel />
        </div>
      </section>
      
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
      
      {/* Admin Access Link */}
      <div className="container py-8">
        <div className="text-center">
          <Link to="/auth">
            <Button variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              Admin Access
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
