
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { XamanPayment } from '@/components/payment/XamanPayment';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function CTASection() {
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);

  const handleGetAlerts = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = (email: string) => {
    setShowPayment(false);
    // In a real implementation, you'd save the email to your backend
    console.log('Payment successful for email:', email);
    navigate('/success');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  return (
    <section className="container py-24">
      <div className="text-center bg-primary/5 rounded-2xl p-12 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to <span className="text-primary">Track Whale Movements?</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join smart traders who stay ahead of the market with real-time whale movement alerts. Get instant notifications when major players move their XRP.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={handleGetAlerts}
            className="text-lg px-8"
          >
            Get Alerts Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8"
          >
            Learn More
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-6">
          ⚡ One-time payment: 5 XRP • Lifetime access • 18 whale wallets monitored
        </p>
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
