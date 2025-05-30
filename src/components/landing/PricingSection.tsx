
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export function PricingSection() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="container py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-muted-foreground">
          Choose the plan that fits your learning journey.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">Starter</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">Free</span>
              <span className="text-muted-foreground">/forever</span>
            </div>
            <ul className="space-y-2 text-sm mb-6">
              <li>✓ 5 beginner courses</li>
              <li>✓ Basic community access</li>
              <li>✓ Mobile app</li>
              <li>✗ Advanced strategies</li>
              <li>✗ Live trading sessions</li>
            </ul>
            <Button className="w-full" variant="outline" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-primary">
          <CardContent className="p-6">
            <Badge className="mb-2">Most Popular</Badge>
            <h3 className="font-semibold text-lg mb-2">Advanced</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2 text-sm mb-6">
              <li>✓ All courses & content</li>
              <li>✓ Advanced strategies</li>
              <li>✓ Live trading sessions</li>
              <li>✓ Priority community support</li>
              <li>✓ Chart analysis tools</li>
            </ul>
            <Button className="w-full" onClick={() => navigate('/pricing')}>
              View Details
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">Pro</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">$99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2 text-sm mb-6">
              <li>✓ Everything in Advanced</li>
              <li>✓ 1-on-1 mentoring</li>
              <li>✓ Custom learning paths</li>
              <li>✓ API access</li>
              <li>✓ White-label options</li>
            </ul>
            <Button className="w-full" variant="outline" onClick={() => navigate('/pricing')}>
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center mt-8">
        <Button variant="link" onClick={() => navigate('/pricing')}>
          Compare all plans and features →
        </Button>
      </div>
    </section>
  );
}
