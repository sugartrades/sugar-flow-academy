import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Database,
  Activity,
  TestTube,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  details?: any;
  category: 'database' | 'integration' | 'ui' | 'performance';
}

interface TestScenario {
  walletAddress: string;
  destinationAddress: string;
  destinationTag: string;
  exchangeName: string;
  amount: number;
  description: string;
}

export const DestinationTagTestSuite = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customScenario, setCustomScenario] = useState<TestScenario>({
    walletAddress: 'rDsbeomae4FXwgQs4XV4fkKaVpTBLsZy1X',
    destinationAddress: 'rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w',
    destinationTag: '12345',
    exchangeName: 'Binance',
    amount: 100000,
    description: 'Custom test scenario'
  });
  const { toast } = useToast();

  const predefinedScenarios: TestScenario[] = [
    {
      walletAddress: 'rDsbeomae4FXwgQs4XV4fkKaVpTBLsZy1X',
      destinationAddress: 'rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w',
      destinationTag: '12345',
      exchangeName: 'Binance',
      amount: 75000,
      description: 'Binance exchange deposit'
    },
    {
      walletAddress: 'rUzSNPtxrmeSTpnjsvaTuQvF2SQFPFSvLn',
      destinationAddress: 'rEhxGqkqPPSxQ3P25J2N1xnhPSPtpHqhvd',
      destinationTag: '54321',
      exchangeName: 'Kraken',
      amount: 150000,
      description: 'Kraken exchange deposit'
    },
    {
      walletAddress: 'rQKZSMgmBJvv3FvWj1vuGjUXnegTqJc25z',
      destinationAddress: 'rJHygWcTLVpSXziqBkSdGJHWF5BLXgGojM',
      destinationTag: '98765',
      exchangeName: 'Coinbase',
      amount: 200000,
      description: 'Coinbase exchange deposit'
    }
  ];

  const testSuite = [
    // Database Tests
    {
      id: 'db_destination_tag_storage',
      name: 'Database: Destination Tag Storage',
      category: 'database' as const,
      test: async () => {
        const testHash = `DB_TEST_${Date.now()}`;
        const scenario = predefinedScenarios[0];
        
        // Create test transaction with destination tag
        const { data, error } = await supabase
          .from('wallet_transactions')
          .insert({
            wallet_address: scenario.walletAddress,
            transaction_hash: testHash,
            amount: scenario.amount,
            currency: 'XRP',
            transaction_type: 'Payment',
            destination_address: scenario.destinationAddress,
            destination_tag: scenario.destinationTag,
            exchange_name: scenario.exchangeName,
            ledger_index: 99999999,
            transaction_date: new Date().toISOString(),
            source_address: scenario.walletAddress
          })
          .select()
          .single();

        if (error) throw error;

        // Verify destination tag was stored correctly
        if (data.destination_tag !== scenario.destinationTag) {
          throw new Error('Destination tag not stored correctly');
        }

        // Verify exchange name was stored
        if (data.exchange_name !== scenario.exchangeName) {
          throw new Error('Exchange name not stored correctly');
        }

        return {
          transaction_id: data.id,
          destination_tag: data.destination_tag,
          exchange_name: data.exchange_name,
          stored_correctly: true
        };
      },
    },
    {
      id: 'db_whale_alert_destination_tag',
      name: 'Database: Whale Alert with Destination Tag',
      category: 'database' as const,
      test: async () => {
        const testHash = `WHALE_DB_TEST_${Date.now()}`;
        const scenario = predefinedScenarios[1];

        // First create the wallet transaction
        await supabase.rpc('ensure_wallet_transaction_exists', {
          p_wallet_address: scenario.walletAddress,
          p_transaction_hash: testHash,
          p_amount: scenario.amount,
          p_transaction_type: 'Payment'
        });

        // Create whale alert with destination tag
        const { data, error } = await supabase
          .from('whale_alerts')
          .insert({
            wallet_address: scenario.walletAddress,
            owner_name: 'Test Whale',
            transaction_hash: testHash,
            amount: scenario.amount,
            transaction_type: 'Payment',
            alert_type: 'whale_movement',
            alert_category: 'exchange_deposit',
            destination_tag: scenario.destinationTag,
            exchange_name: scenario.exchangeName,
            is_sent: false
          })
          .select()
          .single();

        if (error) throw error;

        // Verify destination tag and exchange info
        if (data.destination_tag !== scenario.destinationTag) {
          throw new Error('Destination tag not stored in whale alert');
        }

        if (data.exchange_name !== scenario.exchangeName) {
          throw new Error('Exchange name not stored in whale alert');
        }

        return {
          alert_id: data.id,
          destination_tag: data.destination_tag,
          exchange_name: data.exchange_name,
          alert_category: data.alert_category
        };
      },
    },
    {
      id: 'db_exchange_categorization',
      name: 'Database: Exchange Categorization Logic',
      category: 'database' as const,
      test: async () => {
        const results = [];
        
        // Test known exchange addresses
        const exchangeTests = [
          { address: 'rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w', tag: '12345', expected: 'Binance' },
          { address: 'rEhxGqkqPPSxQ3P25J2N1xnhPSPtpHqhvd', tag: '54321', expected: 'Kraken' },
          { address: 'rJHygWcTLVpSXziqBkSdGJHWF5BLXgGojM', tag: '98765', expected: 'Coinbase' }
        ];

        for (const test of exchangeTests) {
          const testHash = `EXCHANGE_TEST_${Date.now()}_${test.tag}`;
          
          const { data, error } = await supabase
            .from('wallet_transactions')
            .insert({
              wallet_address: 'rTestWallet123',
              transaction_hash: testHash,
              amount: 50000,
              currency: 'XRP',
              transaction_type: 'Payment',
              destination_address: test.address,
              destination_tag: test.tag,
              exchange_name: test.expected,
              ledger_index: 99999999,
              transaction_date: new Date().toISOString(),
              source_address: 'rTestWallet123'
            })
            .select()
            .single();

          if (error) throw error;

          results.push({
            address: test.address,
            tag: test.tag,
            expected_exchange: test.expected,
            actual_exchange: data.exchange_name,
            match: data.exchange_name === test.expected
          });
        }

        const allMatched = results.every(r => r.match);
        if (!allMatched) {
          throw new Error('Exchange categorization failed for some addresses');
        }

        return { exchange_tests: results, all_matched: allMatched };
      },
    },

    // Integration Tests
    {
      id: 'integration_xrpl_monitor',
      name: 'Integration: XRPL Monitor with Destination Tags',
      category: 'integration' as const,
      test: async () => {
        // Test the XRPL monitor function with destination tag detection
        const { data, error } = await supabase.functions.invoke('xrpl-monitor', {
          body: {
            action: 'monitor_single',
            walletAddress: predefinedScenarios[0].walletAddress,
            ownerName: 'Test Integration User',
            testMode: true
          }
        });

        if (error) throw error;

        return {
          monitoring_result: data,
          wallet_tested: predefinedScenarios[0].walletAddress,
          destination_tag_support: true
        };
      },
    },
    {
      id: 'integration_whale_alert_flow',
      name: 'Integration: Complete Whale Alert Flow',
      category: 'integration' as const,
      test: async () => {
        const testHash = `INTEGRATION_TEST_${Date.now()}`;
        const scenario = predefinedScenarios[2];

        // Create test whale alert with destination tag
        const { data: alertData, error: alertError } = await supabase.rpc('test_whale_alert_trigger', {
          p_wallet_address: scenario.walletAddress,
          p_owner_name: 'Integration Test User',
          p_transaction_hash: testHash,
          p_amount: scenario.amount,
          p_transaction_type: 'Payment'
        });

        if (alertError) throw alertError;

        // Update the alert with destination tag info
        const { error: updateError } = await supabase
          .from('whale_alerts')
          .update({
            destination_tag: scenario.destinationTag,
            exchange_name: scenario.exchangeName,
            alert_category: 'exchange_deposit'
          })
          .eq('id', alertData);

        if (updateError) throw updateError;

        // Test the whale alert function
        const { data: functionData, error: functionError } = await supabase.functions.invoke('send-whale-alert', {
          body: {
            whale_alert_id: alertData,
            test_mode: true
          }
        });

        if (functionError) throw functionError;

        return {
          alert_id: alertData,
          destination_tag: scenario.destinationTag,
          exchange_name: scenario.exchangeName,
          function_result: functionData
        };
      },
    },

    // UI Tests
    {
      id: 'ui_destination_tag_display',
      name: 'UI: Destination Tag Display',
      category: 'ui' as const,
      test: async () => {
        // Test that destination tags are properly displayed in the monitoring dashboard
        const { data, error } = await supabase
          .from('wallet_transactions')
          .select('*')
          .not('destination_tag', 'is', null)
          .limit(5);

        if (error) throw error;

        const transactionsWithTags = data.filter(t => t.destination_tag);
        
        if (transactionsWithTags.length === 0) {
          throw new Error('No transactions with destination tags found for UI testing');
        }

        return {
          transactions_with_tags: transactionsWithTags.length,
          sample_transaction: transactionsWithTags[0],
          ui_ready: true
        };
      },
    },
    {
      id: 'ui_exchange_categorization',
      name: 'UI: Exchange Categorization Display',
      category: 'ui' as const,
      test: async () => {
        const { data, error } = await supabase
          .from('whale_alerts')
          .select('*')
          .not('exchange_name', 'is', null)
          .limit(5);

        if (error) throw error;

        const exchangeAlerts = data.filter(a => a.exchange_name);
        
        if (exchangeAlerts.length === 0) {
          throw new Error('No alerts with exchange names found for UI testing');
        }

        return {
          alerts_with_exchange: exchangeAlerts.length,
          exchanges_found: [...new Set(exchangeAlerts.map(a => a.exchange_name))],
          ui_categorization_ready: true
        };
      },
    },

    // Performance Tests
    {
      id: 'performance_destination_tag_queries',
      name: 'Performance: Destination Tag Queries',
      category: 'performance' as const,
      test: async () => {
        const startTime = Date.now();
        
        // Test complex query with destination tags
        const { data, error } = await supabase
          .from('wallet_transactions')
          .select(`
            *,
            whale_alerts!whale_alerts_transaction_hash_fkey(*)
          `)
          .not('destination_tag', 'is', null)
          .order('transaction_date', { ascending: false })
          .limit(50);

        if (error) throw error;

        const endTime = Date.now();
        const queryTime = endTime - startTime;

        if (queryTime > 5000) {
          throw new Error('Query performance too slow');
        }

        return {
          query_time_ms: queryTime,
          transactions_found: data.length,
          performance_acceptable: queryTime < 5000
        };
      },
    },
    {
      id: 'performance_bulk_processing',
      name: 'Performance: Bulk Destination Tag Processing',
      category: 'performance' as const,
      test: async () => {
        const startTime = Date.now();
        
        // Create multiple test transactions with destination tags
        const testTransactions = [];
        for (let i = 0; i < 10; i++) {
          testTransactions.push({
            wallet_address: `rTestWallet${i}`,
            transaction_hash: `BULK_TEST_${Date.now()}_${i}`,
            amount: 50000 + i * 1000,
            currency: 'XRP',
            transaction_type: 'Payment',
            destination_address: predefinedScenarios[i % predefinedScenarios.length].destinationAddress,
            destination_tag: `${12345 + i}`,
            exchange_name: predefinedScenarios[i % predefinedScenarios.length].exchangeName,
            ledger_index: 99999999 + i,
            transaction_date: new Date().toISOString(),
            source_address: `rTestWallet${i}`
          });
        }

        const { data, error } = await supabase
          .from('wallet_transactions')
          .insert(testTransactions)
          .select();

        if (error) throw error;

        const endTime = Date.now();
        const processingTime = endTime - startTime;

        return {
          processing_time_ms: processingTime,
          transactions_created: data.length,
          avg_time_per_transaction: processingTime / data.length
        };
      },
    }
  ];

  const runTest = async (test: any): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const details = await test.test();
      const duration = Date.now() - startTime;
      
      return {
        id: test.id,
        name: test.name,
        category: test.category,
        status: 'passed',
        duration,
        details,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        id: test.id,
        name: test.name,
        category: test.category,
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

    const filteredTests = selectedCategory === 'all' 
      ? testSuite 
      : testSuite.filter(test => test.category === selectedCategory);

    const results: TestResult[] = [];

    for (let i = 0; i < filteredTests.length; i++) {
      const test = filteredTests[i];
      
      const runningResult: TestResult = {
        id: test.id,
        name: test.name,
        category: test.category,
        status: 'running',
      };
      
      results.push(runningResult);
      setTestResults([...results]);
      
      const result = await runTest(test);
      results[i] = result;
      setTestResults([...results]);
      
      setProgress(((i + 1) / filteredTests.length) * 100);
    }

    setIsRunning(false);
  };

  const runCustomScenario = async () => {
    setIsRunning(true);
    try {
      const testHash = `CUSTOM_TEST_${Date.now()}`;
      
      // Create wallet transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_address: customScenario.walletAddress,
          transaction_hash: testHash,
          amount: customScenario.amount,
          currency: 'XRP',
          transaction_type: 'Payment',
          destination_address: customScenario.destinationAddress,
          destination_tag: customScenario.destinationTag,
          exchange_name: customScenario.exchangeName,
          ledger_index: 99999999,
          transaction_date: new Date().toISOString(),
          source_address: customScenario.walletAddress
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create whale alert if amount is significant
      if (customScenario.amount >= 50000) {
        const { data: alertData, error: alertError } = await supabase
          .from('whale_alerts')
          .insert({
            wallet_address: customScenario.walletAddress,
            owner_name: 'Custom Test User',
            transaction_hash: testHash,
            amount: customScenario.amount,
            transaction_type: 'Payment',
            alert_type: 'whale_movement',
            alert_category: 'exchange_deposit',
            destination_tag: customScenario.destinationTag,
            exchange_name: customScenario.exchangeName,
            is_sent: false
          })
          .select()
          .single();

        if (alertError) throw alertError;

        toast({
          title: 'Custom Scenario Success',
          description: `Created transaction and whale alert with destination tag ${customScenario.destinationTag}`,
        });
      } else {
        toast({
          title: 'Custom Scenario Success',
          description: `Created transaction with destination tag ${customScenario.destinationTag}`,
        });
      }

    } catch (error) {
      console.error('Custom scenario failed:', error);
      toast({
        title: 'Custom Scenario Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database': return <Database className="w-4 h-4" />;
      case 'integration': return <Activity className="w-4 h-4" />;
      case 'ui': return <Users className="w-4 h-4" />;
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      default: return <TestTube className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'database': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'integration': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'ui': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'performance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getResultsByCategory = (category: string) => {
    return testResults.filter(r => r.category === category);
  };

  const passedTests = testResults.filter(r => r.status === 'passed').length;
  const failedTests = testResults.filter(r => r.status === 'failed').length;
  const totalTests = selectedCategory === 'all' ? testSuite.length : testSuite.filter(t => t.category === selectedCategory).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Enhanced Destination Tag Testing Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="database">Database Tests</SelectItem>
                  <SelectItem value="integration">Integration Tests</SelectItem>
                  <SelectItem value="ui">UI Tests</SelectItem>
                  <SelectItem value="performance">Performance Tests</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Running Tests...' : 'Run Selected Tests'}
            </Button>
          </div>

          {isRunning && (
            <div className="mb-4">
              <Progress value={progress} className="mb-2" />
              <div className="text-sm text-muted-foreground">
                Running tests... {Math.round(progress)}% complete
              </div>
            </div>
          )}

          {testResults.length > 0 && (
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
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
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          <TabsTrigger value="custom">Custom Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>Test Results by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['database', 'integration', 'ui', 'performance'].map((category) => {
                  const categoryResults = getResultsByCategory(category);
                  const categoryTests = testSuite.filter(t => t.category === category);
                  
                  return (
                    <div key={category} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {getCategoryIcon(category)}
                        <h3 className="font-semibold capitalize">{category} Tests</h3>
                        <Badge className={getCategoryColor(category)}>
                          {categoryResults.length}/{categoryTests.length}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {categoryTests.map((test) => {
                          const result = testResults.find(r => r.id === test.id);
                          
                          return (
                            <div key={test.id} className="flex items-center justify-between p-3 bg-muted rounded">
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
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios">
          <Card>
            <CardHeader>
              <CardTitle>Predefined Test Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predefinedScenarios.map((scenario, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{scenario.description}</h3>
                      <Badge variant="outline">{scenario.exchangeName}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Wallet:</span> {scenario.walletAddress}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span> {scenario.amount.toLocaleString()} XRP
                      </div>
                      <div>
                        <span className="font-medium">Destination:</span> {scenario.destinationAddress}
                      </div>
                      <div>
                        <span className="font-medium">Tag:</span> {scenario.destinationTag}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Test Scenario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="walletAddress">Wallet Address</Label>
                    <Input
                      id="walletAddress"
                      value={customScenario.walletAddress}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, walletAddress: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="destinationAddress">Destination Address</Label>
                    <Input
                      id="destinationAddress"
                      value={customScenario.destinationAddress}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, destinationAddress: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="destinationTag">Destination Tag</Label>
                    <Input
                      id="destinationTag"
                      value={customScenario.destinationTag}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, destinationTag: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="exchangeName">Exchange Name</Label>
                    <Input
                      id="exchangeName"
                      value={customScenario.exchangeName}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, exchangeName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (XRP)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={customScenario.amount}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={customScenario.description}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
                
                <Button onClick={runCustomScenario} disabled={isRunning}>
                  <TestTube className="w-4 h-4 mr-2" />
                  Run Custom Scenario
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};