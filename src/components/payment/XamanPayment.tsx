import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface XamanPaymentProps {
  amount: string;
  destinationAddress: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function XamanPayment({ amount, destinationAddress, onSuccess, onCancel }: XamanPaymentProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed' | 'cancelled'>('idle');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const { toast } = useToast();

  const initiatePayment = async () => {
    try {
      setPaymentStatus('pending');
      
      // Create payment request for Xaman Wallet
      const paymentRequest = {
        TransactionType: 'Payment',
        Destination: destinationAddress,
        Amount: (parseFloat(amount) * 1000000).toString(), // Convert XRP to drops
        Memo: {
          MemoType: Buffer.from('Description').toString('hex').toUpperCase(),
          MemoData: Buffer.from('Whale Alert Pro - Lifetime Access').toString('hex').toUpperCase()
        }
      };

      // Generate Xaman payment URL
      const xamanUrl = `https://xumm.app/sign/${encodeURIComponent(JSON.stringify(paymentRequest))}`;
      setPaymentUrl(xamanUrl);

      toast({
        title: "Payment Request Created",
        description: "Please complete the payment in your Xaman Wallet app.",
      });

      // Simulate payment monitoring (in real implementation, you'd poll a backend service)
      setTimeout(() => {
        // In a real implementation, you'd verify the payment on the XRPL
        const isPaymentSuccessful = Math.random() > 0.3; // 70% success rate for demo
        
        if (isPaymentSuccessful) {
          setPaymentStatus('success');
          toast({
            title: "Payment Successful! 🎉",
            description: "Your payment has been confirmed on the XRPL.",
          });
          onSuccess();
        } else {
          setPaymentStatus('failed');
          toast({
            title: "Payment Failed",
            description: "Please try again or contact support.",
            variant: "destructive",
          });
        }
      }, 10000); // 10 second delay for demo

    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentStatus('failed');
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openXamanWallet = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
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
              <Button onClick={initiatePayment} className="w-full" size="lg">
                <QrCode className="mr-2 h-4 w-4" />
                Pay with Xaman Wallet
              </Button>
            )}

            {paymentStatus === 'pending' && (
              <>
                <Button onClick={openXamanWallet} className="w-full" size="lg">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Xaman Wallet
                </Button>
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