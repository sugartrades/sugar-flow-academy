
import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
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
