import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { XamanPayment } from '@/components/payment/XamanPayment';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const plan = {
  name: "Whale Alert Pro",
  price: "5 XRP",
  period: "one-time",
  description: "Lifetime access to whale movement alerts for serious XRP traders",
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
  buttonText: "Get Lifetime Access"
};

export function PricingSection() {
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);

  const handleUpgrade = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = (email: string, paymentId: string) => {
    setShowPayment(false);
    // In a real implementation, you'd save the email to your backend
    console.log('Payment successful for email:', email);
    navigate(`/success?payment=${paymentId}`);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  return (
    <section id="pricing" className="container py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Simple, Affordable, <span className="text-primary">One-Time</span> Pricing
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          No subscriptions, no hidden fees. Pay once with XRP and get lifetime access to whale movement alerts.
        </p>
      </div>
      
      <div className="max-w-md mx-auto">
        <Card className="relative border-primary shadow-lg">
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
            <Star className="w-4 h-4 mr-1" />
            Best Value
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
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleUpgrade}
            >
              {plan.buttonText}
            </Button>
            
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
                Secure payment via Xaman Wallet
              </p>
              <p className="text-xs text-muted-foreground">
                ✓ Instant activation • ✓ No recurring fees • ✓ 24/7 monitoring
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <XamanPayment
            amount="5"
            destinationAddress="rD7Q1UGja3Ntwq4ak7Y4kCt5ST6PMSn1Vr"
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}