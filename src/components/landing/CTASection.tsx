
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const handleGetAlerts = () => {
    // Smooth scroll to pricing section
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLearnMore = () => {
    // Smooth scroll to features section
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="container py-24">
      <div className="text-center bg-primary/5 rounded-2xl p-12 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to <span className="text-primary">Track Whale Movements?</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join smart traders who stay ahead of the market with real-time whale movement alerts. Get instant Telegram notifications when Chris Larsen and Arthur Britto move their XRP.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={handleGetAlerts}
            className="text-lg px-8"
          >
            Get Alerts Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8"
            onClick={handleLearnMore}
          >
            Learn More
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-6">
          ⚡ Free forever • Lifetime access • Chris Larsen & Arthur Britto wallets monitored
        </p>
      </div>
    </section>
  );
}
