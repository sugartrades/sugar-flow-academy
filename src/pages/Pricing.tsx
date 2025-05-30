
import React from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for getting started with crypto trading',
      features: [
        '5 beginner courses',
        'Basic community access',
        'Mobile app access',
        'Email support'
      ],
      limitations: [
        'No advanced strategies',
        'No live trading sessions',
        'No chart analysis tools'
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outline' as const,
      popular: false
    },
    {
      id: 'advanced',
      name: 'Advanced',
      price: '$29',
      period: 'month',
      description: 'Everything you need to become a confident trader',
      features: [
        'All courses & content',
        'Advanced trading strategies',
        'Live trading sessions',
        'Priority community support',
        'Chart analysis tools',
        'Risk management tools',
        'Progress tracking'
      ],
      limitations: [],
      buttonText: 'Upgrade to Advanced',
      buttonVariant: 'default' as const,
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$99',
      period: 'month',
      description: 'For serious traders who want personalized guidance',
      features: [
        'Everything in Advanced',
        '1-on-1 mentoring sessions',
        'Custom learning paths',
        'API access for automation',
        'White-label options',
        'Advanced portfolio analytics',
        'Direct access to expert traders'
      ],
      limitations: [],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'default' as const,
      popular: false
    }
  ];

  const handleUpgrade = (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (planId === 'starter') return; // Free plan, no action needed
    
    navigate(`/checkout?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Trading Journey</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock advanced features and accelerate your crypto trading education with our premium plans.
          </p>
          {!user && (
            <p className="mt-4 text-sm text-muted-foreground">
              <button 
                onClick={() => navigate('/auth')}
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </button>
              {' '}to get started with our free plan, then upgrade when you're ready.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period !== 'forever' && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    What's included:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-muted-foreground">Not included:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="h-3 w-3 flex-shrink-0">✗</span>
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button 
                  className="w-full"
                  variant={plan.buttonVariant}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={plan.id === 'starter' && !!user}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day free trial • Cancel anytime • No hidden fees
          </p>
        </div>
      </div>
    </div>
  );
}
