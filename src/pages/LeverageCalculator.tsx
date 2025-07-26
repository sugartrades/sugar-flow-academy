import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LeverageCalculatorComponent } from '@/components/calculator/LeverageCalculatorComponent';
import { LeverageCalculatorCTA } from '@/components/calculator/LeverageCalculatorCTA';

export default function LeverageCalculator() {
  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={true} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Leverage Calculator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Calculate your potential profit, loss, and risk metrics with leverage trading. 
            Make informed decisions with precise calculations.
          </p>
        </div>

        <LeverageCalculatorComponent />
        <LeverageCalculatorCTA />
      </main>

      <Footer />
    </div>
  );
}