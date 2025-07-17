import React, { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, MessageSquare, Mail, Bot, ExternalLink, 
  Loader2, AlertCircle, Rocket, BellDot, BarChart 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SignupSuccessContent {
  title: string;
  description: string;
  steps: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
}

interface PaymentSuccessContent {
  title: string;
  description: string;
  features: string[];
}

export default function Success() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const paymentId = searchParams.get('payment');
  const type = searchParams.get('type');

  useEffect(() => {
    const verifyPayment = async () => {
      if (type === 'signup') {
        setIsLoading(false);
        return;
      }

      if (!paymentId) {
        setError('Invalid payment access. Please complete a payment first.');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('process-payment', {
          body: {
            action: 'check_payment',
            paymentId
          }
        });

        if (error) {
          console.error('Payment verification error:', error);
          setError('Failed to verify payment. Please try again.');
          setIsLoading(false);
          return;
        }

        if (data.status === 'completed') {
          setPaymentData(data);
          setIsLoading(false);
        } else {
          setError('Payment not completed or invalid. Please complete your payment first.');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setError('Failed to verify payment. Please try again.');
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [paymentId, type]);

  const handleTelegramRedirect = () => {
    window.open('https://t.me/+Ck8eRLM00gY0YTI5', '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">
            {type === 'signup' ? 'Preparing your account...' : 'Verifying your payment...'}
          </p>
        </div>
      </div>
    );
  }

  if (type === 'signup') {
    const signupContent: SignupSuccessContent = {
      title: "Welcome to XRP Whale Alerts! 🎉",
      description: "Your account has been created successfully. Follow these steps to get started:",
      steps: [
        {
          title: "Join Our Telegram Channel",
          description: "Get instant notifications about whale movements and important updates.",
          icon: <BellDot className="h-6 w-6 text-primary" />
        },
        {
          title: "Configure Your Dashboard",
          description: "Set up your monitoring preferences and alert thresholds.",
          icon: <BarChart className="h-6 w-6 text-primary" />
        },
        {
          title: "Explore Features",
          description: "Discover all the tools and features available to track whale movements.",
          icon: <Rocket className="h-6 w-6 text-primary" />
        }
      ]
    };

    return (
      <div className="min-h-screen bg-background">
        <Header showAuth={false} />
        
        <div className="container max-w-4xl mx-auto py-24">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {signupContent.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {signupContent.description}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {signupContent.steps.map((step, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="mb-2">{step.icon}</div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center space-y-6">
            <Button size="lg" onClick={handleTelegramRedirect} className="gap-2">
              <Bot className="h-5 w-5" />
              Join Telegram Channel
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const paymentContent: PaymentSuccessContent = {
    title: "Payment Successful! 🎉",
    description: "Welcome to exclusive whale tracking! Your lifetime access to our private Telegram channel is now active.",
    features: [
      "Chris Larsen wallet movement alerts (10k+ XRP)",
      "Arthur Britto wallet movement alerts (10k+ XRP)",
      "Real-time transaction notifications",
      "Exchange movement detection",
      "Community of serious XRP traders"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={false} />
      
      <div className="container max-w-4xl mx-auto py-24">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {paymentContent.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            {paymentContent.description}
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Lifetime Access Activated
          </Badge>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Step 1: Join Private Telegram Channel */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Step 1: Join Our Private Telegram Channel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Click the button below to join our exclusive Telegram channel where you'll receive instant alerts for Chris Larsen and Arthur Britto wallet movements.
              </p>
              <Button 
                onClick={handleTelegramRedirect}
                className="w-full"
                size="lg"
              >
                <Bot className="mr-2 h-4 w-4" />
                Join Private Channel
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Exclusive Access Includes:</h4>
                <ul className="text-sm space-y-1">
                  {paymentContent.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Important Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Step 2: Important Channel Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our private channel is for serious XRP traders. Please follow these guidelines to maintain the quality of our community.
              </p>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Channel Guidelines:</h4>
                <ul className="text-sm space-y-1">
                  <li>• This is an alerts-only channel (no chat)</li>
                  <li>• Alerts are sent for movements of 10k+ XRP</li>
                  <li>• Focuses on Chris Larsen & Arthur Britto wallets</li>
                  <li>• Notifications sent 24/7 during market hours</li>
                  <li>• Your access is valid for lifetime</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                Need help? Contact support via the buttons below.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Support Section */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
          <p className="text-muted-foreground mb-4">
            Our support team is here to help you get the most out of your whale tracking alerts.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => window.location.href = 'mailto:hello@sugartrades.io'}>
              <Mail className="mr-2 h-4 w-4" />
              Email Support
            </Button>
            <Button variant="outline" onClick={handleTelegramRedirect}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Join Channel
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}