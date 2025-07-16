
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Smartphone, Mail, Eye, Clock, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Bell,
    title: "Real-time Alerts",
    description: "Get instant notifications when whale wallets move 10k+ XRP to exchanges, giving you advance warning of potential market movements.",
    badge: "Instant"
  },
  {
    icon: Smartphone,
    title: "Telegram Integration",
    description: "Join our exclusive Telegram channel to receive instant alerts directly on your phone. Never miss important whale movements even when away from your computer.",
    badge: "Mobile"
  },
  {
    icon: Mail,
    title: "Key Figures Tracking",
    description: "Monitor wallet movements of Chris Larsen (Ripple Co-founder) and Arthur Britto (XRPL Co-creator) - major figures whose movements can significantly impact XRP markets.",
    badge: "Exclusive"
  },
  {
    icon: Eye,
    title: "20+ Whale Wallets",
    description: "Monitor Chris Larsen and Arthur Britto's key wallet addresses (and counting) - major XRPL figures whose movements can impact the market.",
    badge: "Comprehensive"
  },
  {
    icon: Clock,
    title: "Minute-by-Minute",
    description: "Continuous monitoring every minute ensures you get the fastest possible alerts for time-sensitive trading decisions.",
    badge: "Fast"
  },
  {
    icon: TrendingUp,
    title: "Exchange Detection",
    description: "Advanced tracking specifically identifies movements to major exchanges, indicating potential selling pressure.",
    badge: "Smart"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="container py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Advanced <span className="text-primary">Whale Tracking</span> Features
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Stay ahead of the market with comprehensive monitoring of major XRPL whale wallets and instant alerts for significant movements.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {feature.badge}
                </Badge>
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
