import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Play, Zap } from 'lucide-react';

export const WhaleAlertTestSuite = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testData, setTestData] = useState({
    walletAddress: 'rDsbeomae4FXwgQs4XV4fkKaVpTBLsZy1X',
    ownerName: 'Test Whale',
    amount: '10000',
    transactionType: 'Payment',
    transactionHash: ''
  });
  const { toast } = useToast();

  const generateTestHash = () => {
    const hash = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('').toUpperCase();
    setTestData(prev => ({ ...prev, transactionHash: hash }));
  };

  const testTriggerFunction = async () => {
    setLoading(true);
    try {
      if (!testData.transactionHash) {
        generateTestHash();
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for state update
      }

      const { data, error } = await supabase.rpc('test_whale_alert_trigger', {
        p_wallet_address: testData.walletAddress,
        p_owner_name: testData.ownerName,
        p_transaction_hash: testData.transactionHash || `TEST_${Date.now()}`,
        p_amount: parseFloat(testData.amount),
        p_transaction_type: testData.transactionType
      });

      if (error) throw error;

      const result = {
        id: Date.now(),
        type: 'trigger_test',
        status: 'success',
        message: 'Test whale alert created successfully',
        alertId: data,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [result, ...prev]);
      toast({
        title: "Test Successful",
        description: "Whale alert trigger test completed successfully",
      });

      // Wait a moment then check if the alert was sent
      setTimeout(() => checkAlertStatus(data), 2000);

    } catch (error) {
      console.error('Trigger test failed:', error);
      const result = {
        id: Date.now(),
        type: 'trigger_test',
        status: 'error',
        message: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setTestResults(prev => [result, ...prev]);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAlertStatus = async (alertId: string) => {
    try {
      const { data, error } = await supabase
        .from('whale_alerts')
        .select('*')
        .eq('id', alertId)
        .single();

      if (error) throw error;

      const result = {
        id: Date.now(),
        type: 'status_check',
        status: data.is_sent ? 'success' : 'pending',
        message: data.is_sent 
          ? `Alert sent successfully at ${new Date(data.sent_at).toLocaleString()}`
          : 'Alert is still pending (Telegram notification may be processing)',
        alertData: data,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [result, ...prev]);
    } catch (error) {
      console.error('Status check failed:', error);
      const result = {
        id: Date.now(),
        type: 'status_check',
        status: 'error',
        message: `Status check failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setTestResults(prev => [result, ...prev]);
    }
  };

  const testDirectTriggerCall = async () => {
    setLoading(true);
    try {
      const transactionHash = testData.transactionHash || `TEST_DIRECT_${Date.now()}`;
      
      // First ensure the wallet transaction exists
      const { error: walletError } = await supabase.rpc('ensure_wallet_transaction_exists', {
        p_wallet_address: testData.walletAddress,
        p_transaction_hash: transactionHash,
        p_amount: parseFloat(testData.amount),
        p_transaction_type: testData.transactionType
      });

      if (walletError) {
        const testResult = {
          id: Date.now(),
          type: 'direct_trigger_call',
          status: 'error',
          message: `Failed to create wallet transaction: ${walletError.message}`,
          error: walletError,
          timestamp: new Date().toISOString()
        };
        setTestResults(prev => [testResult, ...prev]);
        return;
      }

      // Now create the whale alert
      const { data: alertData, error: alertError } = await supabase
        .from('whale_alerts')
        .insert({
          wallet_address: testData.walletAddress,
          owner_name: testData.ownerName,
          transaction_hash: transactionHash,
          amount: parseFloat(testData.amount),
          transaction_type: testData.transactionType,
          alert_type: 'whale_movement',
          is_sent: false
        })
        .select()
        .single();

      if (alertError) {
        const testResult = {
          id: Date.now(),
          type: 'direct_trigger_call',
          status: 'error',
          message: `Failed to create test whale alert: ${alertError.message}`,
          error: alertError,
          timestamp: new Date().toISOString()
        };
        setTestResults(prev => [testResult, ...prev]);
        return;
      }

      // Now test the edge function with the real alert ID
      console.log('Attempting to invoke send-whale-alert function with alert ID:', alertData.id);
      
      const { data, error } = await supabase.functions.invoke('send-whale-alert', {
        body: { whale_alert_id: alertData.id },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) {
        // Try to get more details about the error
        let errorDetails = error.message;
        if (error.context) {
          errorDetails += ` | Context: ${JSON.stringify(error.context)}`;
        }
        
        const testResult = {
          id: Date.now(),
          type: 'direct_trigger_call',
          status: 'error',
          message: `Supabase function invoke failed: ${errorDetails}`,
          error: error,
          alertId: alertData.id,
          timestamp: new Date().toISOString()
        };
        setTestResults(prev => [testResult, ...prev]);
        
        // Also try to get the actual HTTP response for debugging
        console.log('Full error object:', error);
        toast({
          title: "Function Error",
          description: `Error: ${errorDetails}`,
          variant: "destructive"
        });
        return;
      }

      const testResult = {
        id: Date.now(),
        type: 'direct_trigger_call',
        status: 'success',
        message: 'Direct edge function call successful! Check Telegram for notification.',
        response: data,
        alertId: alertData.id,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [testResult, ...prev]);
      
      toast({
        title: "Direct Call Successful",
        description: "Edge function worked! Check your Telegram channel.",
      });
      
    } catch (error) {
      console.error('Direct trigger call failed:', error);
      const result = {
        id: Date.now(),
        type: 'direct_trigger_call',
        status: 'error',
        message: `Direct trigger call failed: ${error.message}`,
        error: error,
        timestamp: new Date().toISOString()
      };
      setTestResults(prev => [result, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const testNetHttpPost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('test_net_http_post');
      
      if (error) throw error;

      const result = {
        id: Date.now(),
        type: 'net_http_post_test',
        status: 'success',
        message: data,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [result, ...prev]);
      toast({
        title: "Net HTTP Post Test",
        description: "HTTP post function test completed",
      });

    } catch (error) {
      console.error('Net HTTP post test failed:', error);
      const result = {
        id: Date.now(),
        type: 'net_http_post_test',
        status: 'error',
        message: `Net HTTP Post Error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setTestResults(prev => [result, ...prev]);
      toast({
        title: "Net HTTP Post Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testEdgeFunction = async () => {
    setLoading(true);
    try {
      // First create a test alert
      const { data: alertData, error: alertError } = await supabase
        .from('whale_alerts')
        .insert({
          wallet_address: testData.walletAddress,
          owner_name: testData.ownerName,
          transaction_hash: testData.transactionHash || `DIRECT_TEST_${Date.now()}`,
          amount: parseFloat(testData.amount),
          transaction_type: testData.transactionType,
          alert_type: 'whale_movement',
          is_sent: false
        })
        .select()
        .single();

      if (alertError) throw alertError;

      // Then test the edge function directly
      const { data, error } = await supabase.functions.invoke('send-whale-alert', {
        body: { whale_alert_id: alertData.id }
      });

      if (error) throw error;

      const result = {
        id: Date.now(),
        type: 'edge_function_test',
        status: 'success',
        message: 'Edge function test completed successfully',
        response: data,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [result, ...prev]);
      toast({
        title: "Edge Function Test Successful",
        description: "Direct edge function test completed successfully",
      });

    } catch (error) {
      console.error('Edge function test failed:', error);
      const result = {
        id: Date.now(),
        type: 'edge_function_test',
        status: 'error',
        message: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setTestResults(prev => [result, ...prev]);
      toast({
        title: "Edge Function Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Whale Alert Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-address">Wallet Address</Label>
              <Input
                id="wallet-address"
                value={testData.walletAddress}
                onChange={(e) => setTestData(prev => ({ ...prev, walletAddress: e.target.value }))}
                placeholder="Enter wallet address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner-name">Owner Name</Label>
              <Input
                id="owner-name"
                value={testData.ownerName}
                onChange={(e) => setTestData(prev => ({ ...prev, ownerName: e.target.value }))}
                placeholder="Enter owner name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (XRP)</Label>
              <Input
                id="amount"
                type="number"
                value={testData.amount}
                onChange={(e) => setTestData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Enter amount"
                min="10000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-type">Transaction Type</Label>
              <Input
                id="transaction-type"
                value={testData.transactionType}
                onChange={(e) => setTestData(prev => ({ ...prev, transactionType: e.target.value }))}
                placeholder="Enter transaction type"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-hash">Transaction Hash</Label>
              <div className="flex gap-2">
                <Input
                  id="transaction-hash"
                  value={testData.transactionHash}
                  onChange={(e) => setTestData(prev => ({ ...prev, transactionHash: e.target.value }))}
                  placeholder="Auto-generated or enter custom hash"
                />
                <Button onClick={generateTestHash} variant="outline" size="sm">
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex gap-2">
                <Button
                  onClick={testTriggerFunction}
                  disabled={loading}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Test Trigger Function
                </Button>
                <Button
                  onClick={testEdgeFunction}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Test Edge Function
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={testNetHttpPost}
                  disabled={loading}
                  variant="secondary"
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Test Net HTTP Post
                </Button>
                <Button
                  onClick={testDirectTriggerCall}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Test Direct Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Results</span>
              <Button onClick={clearResults} variant="outline" size="sm">
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No test results yet. Run a test to see results here.
                </div>
              ) : (
                testResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg border ${
                      result.status === 'success' ? 'bg-green-50 border-green-200' :
                      result.status === 'error' ? 'bg-red-50 border-red-200' :
                      'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {result.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      ) : result.status === 'error' ? (
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {result.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm mt-1">{result.message}</div>
                        {result.alertId && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Alert ID: {result.alertId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Test Instructions:</strong>
          <ul className="mt-2 ml-4 space-y-1 text-sm">
            <li>• <strong>Trigger Test:</strong> Tests the database trigger that automatically calls the Telegram bot when a whale alert is created</li>
            <li>• <strong>Edge Function Test:</strong> Tests the Telegram notification edge function directly</li>
            <li>• <strong>Net HTTP Post Test:</strong> Tests if the pg_net extension and http_post function are working correctly</li>
            <li>• <strong>Test Direct Call:</strong> Tests the exact HTTP call that the database trigger makes to the edge function</li>
            <li>• Set amount to 10,000+ XRP to trigger whale alert threshold</li>
            <li>• Check your Telegram channel for notifications after running tests</li>
            <li>• <strong>Troubleshooting:</strong> Run tests in order: Net HTTP Post → Test Direct Call → Edge Function → Trigger Test</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};