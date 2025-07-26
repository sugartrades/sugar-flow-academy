import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';

export function LeverageCalculatorCTA() {
  const handleGetAlerts = () => {
    // Navigate to the main page pricing section
    window.location.href = '/#pricing';
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur">
      <CardContent className="p-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Trade Smarter with <span className="text-primary">Real-Time Intelligence?</span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-6">
            Now that you've calculated your potential profits, enhance your trading strategy with our whale movement alerts. 
            Get notified instantly when Chris Larsen and Arthur Britto move their XRP holdings.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center p-4 rounded-lg bg-background/50">
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Smart Timing</h3>
              <p className="text-sm text-muted-foreground text-center">
                Use whale movements to time your leveraged positions
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-background/50">
              <Shield className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Risk Management</h3>
              <p className="text-sm text-muted-foreground text-center">
                Get early warnings to protect your leveraged positions
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-background/50">
              <Zap className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Instant Alerts</h3>
              <p className="text-sm text-muted-foreground text-center">
                Telegram notifications within seconds of transactions
              </p>
            </div>
          </div>

          <Button 
            size="lg" 
            onClick={handleGetAlerts}
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 group"
          >
            Get Whale Alerts Now
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            ⚡ Free Access • Instant Setup • Chris Larsen & Arthur Britto Wallets Monitored
          </p>
        </div>
      </CardContent>
    </Card>
  );
}