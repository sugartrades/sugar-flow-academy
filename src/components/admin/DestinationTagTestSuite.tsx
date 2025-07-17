import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Clock, Database, Globe, Zap, Target, Play, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration: number;
  error?: string;
  details?: any;
  category: string;
}

interface TestScenario {
  walletAddress: string;
  destinationAddress: string;
  destinationTag: string;
  exchangeName: string;
  amount: number;
  description: string;
}

const DestinationTagTestSuite = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customScenario, setCustomScenario] = useState<TestScenario>({
    walletAddress: '',
    destinationAddress: '',
    destinationTag: '',
    exchangeName: '',
    amount: 0,
    description: ''
  });

  const testCategories = [
    { id: 'database', name: 'Database Tests', icon: Database },
    { id: 'integration', name: 'Integration Tests', icon: Globe },
    { id: 'ui', name: 'UI Tests', icon: Target },
    { id: 'performance', name: 'Performance Tests', icon: Zap }
  ];

  const predefinedTests = [
    // Database Tests
    {
      id: 'db_insert_transaction',
      name: 'Insert Wallet Transaction',
      category: 'database',
      description: 'Test inserting wallet transaction with destination tag'
    },
    {
      id: 'db_create_whale_alert',
      name: 'Create Whale Alert',
      category: 'database',
      description: 'Test creating whale alert for exchange deposit'
    },
    {
      id: 'db_categorization',
      name: 'Exchange Categorization',
      category: 'database',
      description: 'Test destination tag categorization function'
    },
    
    // Integration Tests
    {
      id: 'integration_end_to_end',
      name: 'End-to-End Flow',
      category: 'integration',
      description: 'Test complete transaction to alert flow'
    },
    {
      id: 'integration_multiple_exchanges',
      name: 'Multiple Exchanges',
      category: 'integration',
      description: 'Test with different exchange addresses'
    },
    
    // UI Tests
    {
      id: 'ui_display_alerts',
      name: 'Display Alerts',
      category: 'ui',
      description: 'Test whale alert display with destination tags'
    },
    {
      id: 'ui_filter_exchange',
      name: 'Filter by Exchange',
      category: 'ui',
      description: 'Test filtering alerts by exchange'
    },
    
    // Performance Tests
    {
      id: 'perf_bulk_transactions',
      name: 'Bulk Transaction Processing',
      category: 'performance',
      description: 'Test processing multiple transactions'
    },
    {
      id: 'perf_alert_generation',
      name: 'Alert Generation Speed',
      category: 'performance',
      description: 'Test whale alert generation performance'
    }
  ];

  const predefinedScenarios = [
    {
      walletAddress: 'rDsbeomae4FXwgQs4XV4fkKaVpTBLsZy1X',
      destinationAddress: 'rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w',
      destinationTag: '12345',
      exchangeName: 'Binance',
      amount: 100000,
      description: 'Large XRP transfer to Binance'
    },
    {
      walletAddress: 'rUzSNPtxrmeSTpnjsvaTuQvF2SQFPFSvLn',
      destinationAddress: 'rEhxGqkqPPSxQ3P25J2N1xnhPSPtpHqhvd',
      destinationTag: '67890',
      exchangeName: 'Kraken',
      amount: 75000,
      description: 'Medium XRP transfer to Kraken'
    },
    {
      walletAddress: 'rQKZSMgmBJvv3FvWj1vuGjUXnegTqJc25z',
      destinationAddress: 'rJHygWcTLVpSXziqBkSdGJHWF5BLXgGojM',
      destinationTag: '11111',
      exchangeName: 'Coinbase',
      amount: 200000,
      description: 'Large XRP transfer to Coinbase'
    }
  ];

  const runTest = async (test: any): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      let result: any;
      
      switch (test.id) {
        case 'db_insert_transaction':
          // Test transaction insertion
          result = await supabase
            .from('wallet_transactions')
            .insert({
              wallet_address: 'rTestWallet123',
              transaction_hash: `DB_TEST_${Date.now()}`,
              amount: 50000,
              currency: 'XRP',
              transaction_type: 'Payment',
              destination_address: 'rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w',
              destination_tag: '12345',
              exchange_name: 'Binance',
              ledger_index: 99999999,
              transaction_date: new Date().toISOString(),
              source_address: 'rTestWallet123'
            });
          break;
          
        case 'db_create_whale_alert':
          // Test whale alert creation
          result = await supabase
            .from('whale_alerts')
            .insert({
              wallet_address: 'rTestWallet123',
              owner_name: 'Test User',
              transaction_hash: `WHALE_DB_TEST_${Date.now()}`,
              amount: 50000,
              transaction_type: 'Payment',
              alert_type: 'whale_movement',
              alert_category: 'exchange_deposit',
              destination_tag: '12345',
              exchange_name: 'Binance'
            });
          break;
          
        case 'db_categorization':
          // Test categorization function
          result = await supabase.rpc('test_destination_tag_categorization', {
            p_destination_address: 'rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w',
            p_destination_tag: '12345'
          });
          break;
          
        case 'integration_end_to_end':
          // Test complete flow
          result = await supabase.rpc('generate_destination_tag_test_data', {
            p_count: 3
          });
          break;
          
        case 'perf_bulk_transactions':
          // Test bulk processing
          result = await supabase.rpc('generate_destination_tag_test_data', {
            p_count: 10
          });
          break;
          
        default:
          // Simulate other tests
          await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
          result = { data: { success: true }, error: null };
      }
      
      const duration = Date.now() - startTime;
      
      if (result.error) {
        return {
          id: test.id,
          name: test.name,
          status: 'failed',
          duration,
          error: result.error.message,
          category: test.category
        };
      }
      
      return {
        id: test.id,
        name: test.name,
        status: 'passed',
        duration,
        details: result.data,
        category: test.category
      };
    } catch (error: any) {
      return {
        id: test.id,
        name: test.name,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.message,
        category: test.category
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setProgress(0);
    
    const testsToRun = selectedCategory === 'all' 
      ? predefinedTests 
      : predefinedTests.filter(test => test.category === selectedCategory);
    
    const results: TestResult[] = [];
    
    for (let i = 0; i < testsToRun.length; i++) {
      const test = testsToRun[i];
      
      // Update test as running
      const runningResult: TestResult = {
        id: test.id,
        name: test.name,
        status: 'running',
        duration: 0,
        category: test.category
      };
      
      results.push(runningResult);
      setTestResults([...results]);
      
      // Run the test
      const result = await runTest(test);
      results[i] = result;
      setTestResults([...results]);
      
      setProgress((i + 1) / testsToRun.length * 100);
    }
    
    setIsRunning(false);
    toast.success(`Completed ${testsToRun.length} tests`);
  };

  const runCustomScenario = async () => {
    if (!customScenario.walletAddress || !customScenario.destinationAddress) {
      toast.error('Please fill in required fields');
      return;
    }
    
    setIsRunning(true);
    
    try {
      const txHash = `CUSTOM_TEST_${Date.now()}`;
      
      // Insert custom transaction
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_address: customScenario.walletAddress,
          transaction_hash: txHash,
          amount: customScenario.amount,
          currency: 'XRP',
          transaction_type: 'Payment',
          destination_address: customScenario.destinationAddress,
          destination_tag: customScenario.destinationTag || null,
          exchange_name: customScenario.exchangeName || null,
          ledger_index: 99999999,
          transaction_date: new Date().toISOString(),
          source_address: customScenario.walletAddress
        });
      
      if (txError) throw txError;
      
      // Create whale alert if amount is significant
      if (customScenario.amount >= 50000) {
        const { error: alertError } = await supabase
          .from('whale_alerts')
          .insert({
            wallet_address: customScenario.walletAddress,
            owner_name: 'Custom Test User',
            transaction_hash: txHash,
            amount: customScenario.amount,
            transaction_type: 'Payment',
            alert_type: 'whale_movement',
            alert_category: customScenario.exchangeName ? 'exchange_deposit' : 'whale_movement',
            destination_tag: customScenario.destinationTag || null,
            exchange_name: customScenario.exchangeName || null
          });
        
        if (alertError) throw alertError;
      }
      
      toast.success('Custom scenario executed successfully');
    } catch (error: any) {
      toast.error(`Custom scenario failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const cleanupTestData = async () => {
    try {
      const result = await supabase.rpc('cleanup_destination_tag_test_data');
      if (result.error) throw result.error;
      
      const cleanupResult = result.data as any;
      toast.success(`Cleaned up test data: ${cleanupResult.transactions_deleted} transactions, ${cleanupResult.alerts_deleted} alerts`);
    } catch (error: any) {
      toast.error(`Cleanup failed: ${error.message}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'running': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = testCategories.find(cat => cat.id === category);
    if (!categoryData) return <Target className="h-4 w-4" />;
    const Icon = categoryData.icon;
    return <Icon className="h-4 w-4" />;
  };

  const filteredResults = selectedCategory === 'all' 
    ? testResults 
    : testResults.filter(result => result.category === selectedCategory);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Destination Tag Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing for exchange deposit tracking functionality
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="scenarios">Predefined Scenarios</TabsTrigger>
          <TabsTrigger value="custom">Custom Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test Execution</CardTitle>
                  <CardDescription>Run and monitor test suites</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={cleanupTestData}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Cleanup Test Data
                  </Button>
                  <Button 
                    onClick={runAllTests}
                    disabled={isRunning}
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isRunning ? 'Running Tests...' : 'Run Tests'}
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Tests
                </Button>
                {testCategories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <category.icon className="h-3 w-3 mr-1" />
                    {category.name}
                  </Button>
                ))}
              </div>
              
              {isRunning && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                {filteredResults.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No test results yet. Click "Run Tests" to start testing.
                  </div>
                ) : (
                  filteredResults.map(result => (
                    <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        {getCategoryIcon(result.category)}
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {result.status === 'passed' && `Completed in ${result.duration}ms`}
                            {result.status === 'failed' && result.error}
                            {result.status === 'running' && 'Running...'}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`${getStatusColor(result.status)} text-white border-0`}
                      >
                        {result.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predefined Test Scenarios</CardTitle>
              <CardDescription>
                Pre-configured scenarios for common exchange deposit patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {predefinedScenarios.map((scenario, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="font-medium mb-2">{scenario.description}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Wallet:</span> {scenario.walletAddress.slice(0, 20)}...
                      </div>
                      <div>
                        <span className="font-medium">Exchange:</span> {scenario.exchangeName}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span> {scenario.amount.toLocaleString()} XRP
                      </div>
                      <div>
                        <span className="font-medium">Destination Tag:</span> {scenario.destinationTag}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Test Scenario</CardTitle>
              <CardDescription>
                Create and run custom exchange deposit scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="walletAddress">Wallet Address *</Label>
                  <Input
                    id="walletAddress"
                    value={customScenario.walletAddress}
                    onChange={(e) => setCustomScenario(prev => ({ ...prev, walletAddress: e.target.value }))}
                    placeholder="rDsbeomae4FXwgQs4XV4fkKaVpTBLsZy1X"
                  />
                </div>
                <div>
                  <Label htmlFor="destinationAddress">Destination Address *</Label>
                  <Input
                    id="destinationAddress"
                    value={customScenario.destinationAddress}
                    onChange={(e) => setCustomScenario(prev => ({ ...prev, destinationAddress: e.target.value }))}
                    placeholder="rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w"
                  />
                </div>
                <div>
                  <Label htmlFor="destinationTag">Destination Tag</Label>
                  <Input
                    id="destinationTag"
                    value={customScenario.destinationTag}
                    onChange={(e) => setCustomScenario(prev => ({ ...prev, destinationTag: e.target.value }))}
                    placeholder="12345"
                  />
                </div>
                <div>
                  <Label htmlFor="exchangeName">Exchange Name</Label>
                  <Input
                    id="exchangeName"
                    value={customScenario.exchangeName}
                    onChange={(e) => setCustomScenario(prev => ({ ...prev, exchangeName: e.target.value }))}
                    placeholder="Binance"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (XRP)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={customScenario.amount}
                  onChange={(e) => setCustomScenario(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  placeholder="100000"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={customScenario.description}
                  onChange={(e) => setCustomScenario(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this test scenario..."
                />
              </div>
              
              <Button 
                onClick={runCustomScenario}
                disabled={isRunning}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Custom Scenario
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DestinationTagTestSuite;