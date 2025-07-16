import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';

export const EmailTestSuite: React.FC = () => {
  const [testData, setTestData] = useState({
    email: '',
    amount: '100',
    transactionHash: 'test_tx_' + Date.now(),
    paymentId: 'test_payment_' + Date.now()
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; emailId?: string } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setTestData(prev => ({ ...prev, [field]: value }));
  };

  const testEmailSystem = async () => {
    if (!testData.email) {
      setResult({ success: false, message: 'Please enter an email address' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log('Testing email system with data:', testData);
      
      const { data, error } = await supabase.functions.invoke('send-payment-confirmation', {
        body: testData
      });

      if (error) {
        throw error;
      }

      console.log('Email test result:', data);
      setResult({
        success: true,
        message: 'Test email sent successfully!',
        emailId: data.emailId
      });
    } catch (error: any) {
      console.error('Email test failed:', error);
      setResult({
        success: false,
        message: error.message || 'Failed to send test email'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewTestData = () => {
    setTestData(prev => ({
      ...prev,
      transactionHash: 'test_tx_' + Date.now(),
      paymentId: 'test_payment_' + Date.now()
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Email Test Suite
        </CardTitle>
        <CardDescription>
          Test the payment confirmation email system by sending a test email
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Test Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="your-email@example.com"
              value={testData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="test-amount">Amount (XRP)</Label>
            <Input
              id="test-amount"
              type="number"
              placeholder="100"
              value={testData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-tx-hash">Transaction Hash</Label>
          <div className="flex gap-2">
            <Input
              id="test-tx-hash"
              placeholder="test_tx_123..."
              value={testData.transactionHash}
              onChange={(e) => handleInputChange('transactionHash', e.target.value)}
              readOnly
            />
            <Button variant="outline" onClick={generateNewTestData}>
              Generate New
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-payment-id">Payment ID</Label>
          <Input
            id="test-payment-id"
            placeholder="test_payment_123..."
            value={testData.paymentId}
            onChange={(e) => handleInputChange('paymentId', e.target.value)}
            readOnly
          />
        </div>
        
        <Button 
          onClick={testEmailSystem} 
          disabled={isLoading || !testData.email}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Test Email...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Test Email
            </>
          )}
        </Button>
        
        {result && (
          <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription>
                  {result.message}
                  {result.emailId && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Email ID: {result.emailId}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
        
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Test Instructions:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>1. Enter your email address to receive the test email</li>
            <li>2. The amount, transaction hash, and payment ID are pre-filled with test data</li>
            <li>3. Click "Send Test Email" to trigger the email system</li>
            <li>4. Check your inbox (and spam folder) for the confirmation email</li>
            <li>5. Verify that the email content displays correctly</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};