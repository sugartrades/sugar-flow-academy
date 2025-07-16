import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, ExternalLink, CheckCircle, Clock, AlertCircle, Mail, Smartphone, Monitor, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDeviceDetection, generateXamanDeepLink, generateAppStoreLinks } from '@/hooks/useDeviceDetection';
import QRCode from 'qrcode';

interface XamanPaymentProps {
  amount: string;
  destinationAddress: string;
  onSuccess: (email: string, paymentId: string) => void;
  onCancel: () => void;
}

export function XamanPayment({ amount, destinationAddress, onSuccess, onCancel }: XamanPaymentProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed' | 'cancelled'>('idle');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const deviceInfo = useDeviceDetection();
  const appStoreLinks = generateAppStoreLinks();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          action: 'check_payment',
          paymentId
        }
      });

      if (error) {
        console.error('Payment status check error:', error);
        return;
      }

      const result = data;
      
      if (result.status === 'completed') {
        setPaymentStatus('success');
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
        toast({
          title: "Payment Confirmed! 🎉",
          description: "Your payment has been verified and access is being processed!",
        });
        
        onSuccess(email, paymentId);
      } else if (result.status === 'failed' || result.status === 'expired') {
        setPaymentStatus('failed');
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        toast({
          title: "Payment Failed",
          description: result.error || "Payment verification failed.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment status check error:', error);
    }
  };

  const startPaymentMonitoring = (paymentId: string) => {
    // Start polling for payment status
    const interval = setInterval(() => {
      checkPaymentStatus(paymentId);
    }, 3000); // Check every 3 seconds

    setPollingInterval(interval);

    // Stop polling after 15 minutes (timeout)
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setPollingInterval(null);
        if (paymentStatus === 'pending') {
          setPaymentStatus('failed');
          toast({
            title: "Payment Timeout",
            description: "Payment verification timed out. Please try again.",
            variant: "destructive",
          });
        }
      }
    }, 15 * 60 * 1000);
  };

  const initiatePayment = async () => {
    // Validate email first
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setEmailError('');
    
    try {
      setPaymentStatus('pending');
      
      // Create payment request using the backend
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          action: 'create_payment',
          email,
          amount: parseFloat(amount),
          destinationAddress
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || error.toString() || 'Failed to send a request to the Edge Function');
      }

      const result = data;
      setPaymentId(result.paymentId);
      setPaymentUrl(result.xamanUrl);

      // Generate QR code for desktop users
      if (deviceInfo.isDesktop) {
        try {
          console.log('Generating QR code for URL:', result.xamanUrl);
          const qrCodeUrl = await QRCode.toDataURL(result.xamanUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          setQrCodeDataUrl(qrCodeUrl);
          console.log('QR code generated successfully');
        } catch (error) {
          console.error('Error generating QR code:', error);
          toast({
            title: "QR Code Error",
            description: "Could not generate QR code, but you can still use the payment link.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Payment Request Created",
        description: deviceInfo.isMobile 
          ? "Please complete the payment in your Xaman Wallet app."
          : "Scan the QR code with your Xaman Wallet app or open the link on your mobile device.",
      });

      // Start monitoring payment status
      startPaymentMonitoring(result.paymentId);

    } catch (error) {
      console.error('Payment initiation error:', error);
      console.error('Error details:', error);
      setPaymentStatus('failed');
      
      // More specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Payment Error",
        description: `Failed to initiate payment: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const openXamanWallet = () => {
    if (paymentUrl) {
      if (deviceInfo.isMobile) {
        // Try to open the Xaman app directly with deep link
        const deepLink = generateXamanDeepLink(paymentUrl);
        window.location.href = deepLink;
        
        // Fallback to web URL after a short delay if app doesn't open
        setTimeout(() => {
          window.open(paymentUrl, '_blank');
        }, 1000);
      } else {
        // Desktop users get the web URL
        window.open(paymentUrl, '_blank');
      }
    }
  };

  const openAppStore = () => {
    if (deviceInfo.isIOS) {
      window.open(appStoreLinks.ios, '_blank');
    } else if (deviceInfo.isAndroid) {
      window.open(appStoreLinks.android, '_blank');
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <QrCode className="h-5 w-5" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'Waiting for payment confirmation...';
      case 'success':
        return 'Payment confirmed! Welcome to Whale Alert Pro!';
      case 'failed':
        return 'Payment failed. Please try again.';
      default:
        return 'Ready to process payment';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {getStatusIcon()}
          Xaman Wallet Payment
        </CardTitle>
        <CardDescription>
          {getStatusMessage()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-primary">{amount} XRP</div>
          <Badge variant="secondary">One-time payment</Badge>
        </div>

        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 ${emailError ? 'border-red-500' : ''}`}
                disabled={paymentStatus === 'pending'}
              />
            </div>
            {emailError && (
              <p className="text-sm text-red-500">{emailError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              We'll send setup instructions and confirmation to this email
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Payment Details:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">{amount} XRP</span>
              </div>
              <div className="flex justify-between">
                <span>Destination:</span>
                <span className="font-mono text-xs">{destinationAddress.slice(0, 8)}...{destinationAddress.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="font-medium">XRPL Mainnet</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {paymentStatus === 'idle' && (
              <Button onClick={initiatePayment} className="w-full" size="lg" disabled={!email.trim()}>
                <QrCode className="mr-2 h-4 w-4" />
                Pay with Xaman Wallet
              </Button>
            )}

            {paymentStatus === 'pending' && (
              <>
                {deviceInfo.isDesktop && qrCodeDataUrl && (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-center space-y-3">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Monitor className="h-4 w-4" />
                          <span>Scan with your mobile device</span>
                        </div>
                        <div className="flex justify-center">
                          <img src={qrCodeDataUrl} alt="Payment QR Code" className="w-40 h-40" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Using Xaman Wallet App</p>
                          <p className="text-xs text-muted-foreground">
                            1. Open Xaman Wallet on your phone<br />
                            2. Tap "Scan QR" or camera icon<br />
                            3. Scan this QR code to complete payment
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <Button onClick={openXamanWallet} variant="outline" size="sm" className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Or open on this device
                      </Button>
                    </div>
                  </div>
                )}

                {deviceInfo.isMobile && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900">Mobile Payment</p>
                      </div>
                      <p className="text-sm text-blue-700">
                        Tap the button below to open your Xaman Wallet app directly
                      </p>
                    </div>
                    
                    <Button onClick={openXamanWallet} className="w-full" size="lg">
                      <Smartphone className="mr-2 h-4 w-4" />
                      Open Xaman Wallet App
                    </Button>
                    
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Don't have Xaman Wallet?</p>
                      <Button onClick={openAppStore} variant="outline" size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Xaman Wallet
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    Monitoring payment on XRPL...
                  </p>
                </div>
              </>
            )}

            {paymentStatus === 'success' && (
              <div className="text-center text-green-600">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Payment Confirmed!</p>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="space-y-2">
                <div className="text-center text-red-600">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Payment Failed</p>
                </div>
                <Button onClick={initiatePayment} variant="outline" className="w-full">
                  Try Again
                </Button>
              </div>
            )}

            <Button onClick={onCancel} variant="ghost" className="w-full">
              Cancel
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <p>⚡ Instant confirmation on XRPL</p>
          <p>🔒 Secure payment via Xaman Wallet</p>
        </div>
      </CardContent>
    </Card>
  );
}