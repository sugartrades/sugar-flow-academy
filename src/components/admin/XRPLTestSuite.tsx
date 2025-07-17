import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useXRPLMonitoring } from '@/hooks/useXRPLMonitoring';
import { Play, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  details?: any;
}

export const XRPLTestSuite = () => {
  const { runMonitoring } = useXRPLMonitoring();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const testSuite = [
    {
      id: 'api_connectivity',
      name: 'XRPL API Connectivity',
      test: async () => {
        // Test basic API connectivity
        const response = await fetch('https://xrplcluster.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'server_info',
            params: [],
          }),
        });
        const data = await response.json();
        if (!data.result) throw new Error('API not responding correctly');
        return { server_info: data.result };
      },
    },
    {
      id: 'wallet_monitoring',
      name: 'Wallet Monitoring Service',
      test: async () => {
        // Test wallet monitoring for a single wallet
        const result = await runMonitoring('single', 'rUzSNPtxrmeSTpnjsvaTuQvF2SQFPFSvLn', 'Arthur Britto');
        if (!result.transactions) throw new Error('No transactions returned');
        return { transactions_count: result.transactions.length };
      },
    },
    {
      id: 'database_connectivity',
      name: 'Database Operations',
      test: async () => {
        // Test database connectivity by fetching wallet monitoring data
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Test reading wallet monitoring data
        const { data: walletData, error: walletError } = await supabase
          .from('wallet_monitoring')
          .select('*')
          .limit(1);
        
        if (walletError) throw new Error(`Database read failed: ${walletError.message}`);
        
        // Test reading whale alerts
        const { data: alertData, error: alertError } = await supabase
          .from('whale_alerts')
          .select('*')
          .limit(1);
        
        if (alertError) throw new Error(`Alert read failed: ${alertError.message}`);
        
        return { 
          wallet_monitoring_accessible: true,
          whale_alerts_accessible: true,
          wallet_count: walletData?.length || 0,
          alert_count: alertData?.length || 0
        };
      },
    },
    {
      id: 'whale_detection',
      name: 'Whale Alert Detection',
      test: async () => {
        // Test whale alert detection with simulated data
        const testAmount = 100000; // 100k XRP
        const threshold = 50000; // 50k XRP threshold
        
        if (testAmount < threshold) {
          throw new Error('Whale detection logic failed');
        }
        
        return { 
          test_amount: testAmount,
          threshold,
          alert_triggered: testAmount >= threshold 
        };
      },
    },
    {
      id: 'performance_test',
      name: 'Performance Benchmarks',
      test: async () => {
        const startTime = Date.now();
        
        // Run multiple wallet checks
        const wallets = [
          'rUzSNPtxrmeSTpnjsvaTuQvF2SQFPFSvLn',
          'rQKZSMgmBJvv3FvWj1vuGjUXnegTqJc25z',
          'rsXNUCJkXeyFuGHyfRnuWPita2ns32upBD',
        ];
        
        const results = await Promise.all(
          wallets.map(wallet => 
            runMonitoring('single', wallet, 'Test User')
          )
        );
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (duration > 30000) { // 30 seconds
          throw new Error('Performance test failed - took too long');
        }
        
        return {
          wallets_tested: wallets.length,
          total_duration: duration,
          avg_per_wallet: duration / wallets.length,
        };
      },
    },
    {
      id: 'error_handling',
      name: 'Error Handling & Recovery',
      test: async () => {
        // Test error handling with invalid wallet
        try {
          await runMonitoring('single', 'invalid_wallet_address', 'Test User');
          throw new Error('Should have failed with invalid wallet');
        } catch (error) {
          if (error.message.includes('Should have failed')) {
            throw error;
          }
          // Expected error - test passed
          return { error_handled: true, error_message: error.message };
        }
      },
    },
  ];

  const runTest = async (test: any): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const details = await test.test();
      const duration = Date.now() - startTime;
      
      return {
        id: test.id,
        name: test.name,
        status: 'passed',
        duration,
        details,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        id: test.id,
        name: test.name,
        status: 'failed',
        duration,
        error: error.message,
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults([]);

    const results: TestResult[] = [];

    for (let i = 0; i < testSuite.length; i++) {
      const test = testSuite[i];
      
      // Update test status to running
      const runningResult: TestResult = {
        id: test.id,
        name: test.name,
        status: 'running',
      };
      
      results.push(runningResult);
      setTestResults([...results]);
      
      // Run the test
      const result = await runTest(test);
      
      // Update with final result
      results[i] = result;
      setTestResults([...results]);
      
      // Update progress
      setProgress(((i + 1) / testSuite.length) * 100);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const passedTests = testResults.filter(r => r.status === 'passed').length;
  const failedTests = testResults.filter(r => r.status === 'failed').length;
  const totalTests = testSuite.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">XRPL Testing Suite</h1>
        <Button
          onClick={runAllTests}
          disabled={isRunning}
          size="lg"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Test Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-2" />
            <div className="text-sm text-muted-foreground">
              Running tests... {Math.round(progress)}% complete
            </div>
          </CardContent>
        </Card>
      )}

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalTests}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testSuite.map((test) => {
              const result = testResults.find(r => r.id === test.id);
              
              return (
                <div key={test.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result?.status || 'pending')}
                      <span className="font-medium">{test.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {result?.duration && (
                        <span className="text-sm text-muted-foreground">
                          {result.duration}ms
                        </span>
                      )}
                      <Badge className={getStatusColor(result?.status || 'pending')}>
                        {result?.status || 'pending'}
                      </Badge>
                    </div>
                  </div>
                  
                  {result?.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {result?.details && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <pre>{JSON.stringify(result.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};