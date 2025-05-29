
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="bg-primary py-24">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Start Your Trading Journey?
        </h2>
        <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
          Join thousands of successful traders who started their journey with SugarTrades.io
        </p>
        <Button size="lg" variant="secondary" onClick={() => navigate('/signup')}>
          Start Learning Today - It's Free!
        </Button>
      </div>
    </section>
  );
}
