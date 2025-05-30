
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const planId = searchParams.get('plan');
  
  const plans = {
    advanced: {
      name: 'Advanced',
      price: 29,
      features: ['All courses', 'Live sessions', 'Chart tools', 'Priority support']
    },
    pro: {
      name: 'Pro',
      price: 99,
      features: ['Everything in Advanced', '1-on-1 mentoring', 'API access', 'Custom learning paths']
    }
  };

  const selectedPlan = planId ? plans[planId as keyof typeof plans] : null;

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!selectedPlan) {
    navigate('/pricing');
    return null;
  }

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Payment Successful! 🎉",
      description: `Welcome to ${selectedPlan.name}! Your account has been upgraded.`,
    });
    
    setProcessing(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/pricing')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pricing
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your selected plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="font-semibold">{selectedPlan.name} Plan</h3>
                  <p className="text-sm text-muted-foreground">Monthly subscription</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${selectedPlan.price}/month</p>
                  <Badge variant="secondary" className="text-xs">7-day trial</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">What's included:</h4>
                <ul className="text-sm space-y-1">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-primary rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total today:</span>
                  <span className="text-xl font-bold">$0.00</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Free for 7 days, then ${selectedPlan.price}/month
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>
                This is a demo. No real payment will be processed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input 
                  id="cardNumber" 
                  placeholder="4242 4242 4242 4242" 
                  defaultValue="4242 4242 4242 4242"
                  disabled
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input 
                    id="expiry" 
                    placeholder="MM/YY" 
                    defaultValue="12/28"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input 
                    id="cvc" 
                    placeholder="123" 
                    defaultValue="123"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Cardholder Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  defaultValue="John Doe"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={user.email || ''} 
                  disabled
                />
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full" 
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Start 7-Day Free Trial
                    </div>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                <Lock className="h-3 w-3 inline mr-1" />
                Secure checkout powered by Stripe (Demo Mode)
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
