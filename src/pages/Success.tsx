import React, { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageSquare, Mail, Bot, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Success() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const paymentId = searchParams.get('payment');

  useEffect(() => {
    const verifyPayment = async () => {
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
  }, [paymentId]);

  const handleTelegramRedirect = () => {
    window.open('https://t.me/+XRPWhaleAlerts_Private', '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Verifying your payment...</p>
        </div>
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

  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={false} />
      
      <div className="container max-w-4xl mx-auto py-24">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Welcome to exclusive whale tracking! Your lifetime access to our private Telegram channel is now active.
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
                  <li>• Chris Larsen wallet movement alerts (10k+ XRP)</li>
                  <li>• Arthur Britto wallet movement alerts (10k+ XRP)</li>
                  <li>• Real-time transaction notifications</li>
                  <li>• Exchange movement detection</li>
                  <li>• Community of serious XRP traders</li>
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

        {/* Quick Start Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-1">Join Channel</h3>
                <p className="text-sm text-muted-foreground">Click the button above to join our private channel</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-1">Stay Active</h3>
                <p className="text-sm text-muted-foreground">Keep notifications enabled for instant alerts</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-1">Start Receiving</h3>
                <p className="text-sm text-muted-foreground">Get real-time whale alerts instantly</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
          <p className="text-muted-foreground mb-4">
            Our support team is here to help you get the most out of your whale tracking alerts.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => window.open('mailto:hello@sugartrades.io')}>
              <Mail className="mr-2 h-4 w-4" />
              Email Support
            </Button>
            <Button variant="outline" onClick={() => window.open('https://t.me/+XRPWhaleAlerts_Private')}>
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