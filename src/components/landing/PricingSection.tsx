import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { XamanPayment } from '@/components/payment/XamanPayment';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const plan = {
  name: "Whale Alert Pro",
  price: "Free",
  period: "forever",
  description: "Free access to whale movement alerts for all XRP traders",
  features: [
    "Real-time monitoring of 20+ whale wallets (and counting)",
    "Instant alerts for 10k+ XRP movements",
    "Chris Larsen & Arthur Britto wallet tracking",
    "Exclusive Telegram channel access",
    "Exchange detection technology",
    "Historical movement data",
    "Custom threshold settings",
    "Priority support"
  ],
  buttonText: "Get Free Access"
};

export function PricingSection() {
  const navigate = useNavigate();
  const [showTipping, setShowTipping] = useState(false);

  const handleFreeAccess = () => {
    navigate('/auth');
  };

  const handleTip = () => {
    setShowTipping(true);
  };

  const handleTipSuccess = (email: string, paymentId: string) => {
    setShowTipping(false);
    console.log('Tip successful for email:', email);
    navigate(`/success?payment=${paymentId}`);
  };

  const handleTipCancel = () => {
    setShowTipping(false);
  };

  return (
    <section id="pricing" className="container py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="text-primary">Free</span> Access for Everyone
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          No cost, no subscriptions, no hidden fees. Free access to whale movement alerts for all XRP traders.
        </p>
      </div>
      
      <div className="max-w-md mx-auto">
        <Card className="relative border-primary shadow-lg">
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
            <Star className="w-4 h-4 mr-1" />
            Free
          </Badge>
          
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              {plan.name}
            </CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground"> {plan.period}</span>
            </div>
            <CardDescription className="mt-2">
              {plan.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleFreeAccess}
              >
                {plan.buttonText}
              </Button>
              <Button 
                variant="outline"
                className="w-full" 
                size="lg"
                onClick={handleTip}
              >
                <Heart className="w-4 h-4 mr-2" />
                Send a Tip (Optional)
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-4">Everything included:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Completely free access • Optional tips appreciated
              </p>
              <p className="text-xs text-muted-foreground">
                ✓ Instant activation • ✓ No fees required • ✓ 24/7 monitoring
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showTipping} onOpenChange={setShowTipping}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send a Tip</DialogTitle>
          </DialogHeader>
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              Your tip helps support the development and maintenance of this free service.
            </p>
          </div>
          <XamanPayment
            amount="5"
            destinationAddress="rD7Q1UGja3Ntwq4ak7Y4kCt5ST6PMSn1Vr"
            onSuccess={handleTipSuccess}
            onCancel={handleTipCancel}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}