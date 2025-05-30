
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="container py-24 text-center">
      <div className="mx-auto max-w-4xl space-y-8">
        <Badge variant="secondary" className="mb-4">
          🧪 Now in Beta – Join Our First 500 Founding Learners
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Master Crypto Trading From Scratch—The{' '}
          <span className="text-primary">Smart, Sweet, and Simple Way</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Turn confusion into confidence with our step-by-step, beginner-friendly crypto trading platform—backed by expert insights and gamified learning.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
            Start Learning Free
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          ✨ No credit card required • 7-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}
