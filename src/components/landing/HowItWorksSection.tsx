import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Smartphone, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    icon: Bell,
    title: "Join Free",
    description: "Get free access to whale alerts - no payment required, no hidden fees.",
    step: "1"
  },
  {
    icon: Smartphone,
    title: "Join Telegram",
    description: "Get access to our exclusive Telegram channel for instant alerts on Chris Larsen and Arthur Britto wallet movements.",
    step: "2"
  },
  {
    icon: Bell,
    title: "Get Alerts",
    description: "Receive instant Telegram notifications when tracked wallets move 10k+ XRP to exchanges.",
    step: "3"
  },
  {
    icon: TrendingUp,
    title: "Trade Smart",
    description: "Use early whale movement intel to make informed trading decisions ahead of the market.",
    step: "4"
  }
];

export function HowItWorksSection() {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="container py-24 bg-muted/30">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          How It <span className="text-primary">Works</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get started with whale alerts in just 4 simple steps. No payment required, no complex setup.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {steps.map((step, index) => (
          <Card key={index} className="text-center relative">
            <CardHeader>
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <step.icon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{step.step}</span>
                </div>
              </div>
              <CardTitle className="text-xl">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                {step.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}