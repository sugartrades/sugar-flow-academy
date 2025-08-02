import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { XRPMarketCapVisualizer } from '@/components/calculator/XRPMarketCapVisualizer';
import { XRPMarketDataPanel } from '@/components/calculator/XRPMarketDataPanel';
import { useXRPFloatSlider } from '@/hooks/useXRPFloatSlider';

export default function MarketCapMultiplier() {
  const xrpFloatSlider = useXRPFloatSlider();
  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={true} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Market Cap Multiplier
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Simulate how large buy orders impact XRP's price through market cap visualization. 
            Understand the multiplier effect of order book depth on price movement.
          </p>
        </div>

        <XRPMarketDataPanel xrpFloatSlider={xrpFloatSlider} />
        <XRPMarketCapVisualizer xrpFloatSlider={xrpFloatSlider} />
      </main>

      <Footer />
    </div>
  );
}