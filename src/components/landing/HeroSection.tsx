
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Shield, Zap } from 'lucide-react';

export function HeroSection() {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="container py-24 text-center">
      <div className="mx-auto max-w-4xl space-y-8">
        <Badge variant="secondary" className="mb-4">
          🔔 Real-time XRPL Whale Movement Alerts
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Never Miss a{' '}
          <span className="text-primary">Whale Movement</span> Again
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get instant Telegram alerts when Chris Larsen and Arthur Britto move their XRP. Stay ahead of the market with real-time monitoring of these influential XRPL figures.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center my-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Real-time Alerts</p>
              <p className="text-sm text-muted-foreground">Telegram Channel</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Whale Tracking</p>
              <p className="text-sm text-muted-foreground">20+ Major Wallets (and counting)</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">10k+ XRP Moves</p>
              <p className="text-sm text-muted-foreground">Threshold alerts</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={scrollToPricing} className="text-lg px-8">
            Get Alerts Now
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => {
            const featuresSection = document.getElementById('features');
            if (featuresSection) {
              featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}>
            Learn More
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          ⚡ One-time fee: 5 XRP • Real-time monitoring • Telegram channel access
        </p>
      </div>
    </section>
  );
}
