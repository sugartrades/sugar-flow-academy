import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WalletTransaction {
  id: string;
  wallet_address: string;
  transaction_hash: string;
  amount: number;
  currency: string;
  transaction_type: string;
  destination_address?: string;
  source_address?: string;
  ledger_index: number;
  transaction_date: string;
  created_at: string;
}

export interface WhaleAlert {
  id: string;
  wallet_address: string;
  owner_name: string;
  transaction_hash: string;
  amount: number;
  transaction_type: string;
  alert_type: string;
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
}

export interface MonitoringHealth {
  id: string;
  service_name: string;
  status: string;
  last_check_at: string;
  error_message?: string;
  response_time_ms?: number;
  created_at: string;
}

export interface WalletMonitoring {
  id: string;
  wallet_address: string;
  owner_name: string;
  is_active: boolean;
  last_checked_at?: string;
  last_ledger_index?: number;
  alert_threshold: number;
  created_at: string;
  updated_at: string;
}

export const useXRPLMonitoring = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [alerts, setAlerts] = useState<WhaleAlert[]>([]);
  const [healthStatus, setHealthStatus] = useState<MonitoringHealth[]>([]);
  const [walletMonitoring, setWalletMonitoring] = useState<WalletMonitoring[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTransactions = async (limit: number = 50) => {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch transactions',
        variant: 'destructive',
      });
    }
  };

  const fetchAlerts = async (limit: number = 50) => {
    try {
      const { data, error } = await supabase
        .from('whale_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch whale alerts',
        variant: 'destructive',
      });
    }
  };

  const fetchHealthStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('monitoring_health')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHealthStatus(data || []);
    } catch (error) {
      console.error('Error fetching health status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch monitoring health',
        variant: 'destructive',
      });
    }
  };

  const fetchWalletMonitoring = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_monitoring')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setWalletMonitoring(data || []);
    } catch (error) {
      console.error('Error fetching wallet monitoring:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch wallet monitoring data',
        variant: 'destructive',
      });
    }
  };

  const runMonitoring = async (type: 'single' | 'all', walletAddress?: string, ownerName?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('xrpl-monitor', {
        body: {
          action: type === 'single' ? 'monitor_single' : 'monitor_all',
          walletAddress,
          ownerName,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Monitoring ${type === 'single' ? 'single wallet' : 'all wallets'} completed`,
      });

      // Refresh data
      await Promise.all([
        fetchTransactions(),
        fetchAlerts(),
        fetchHealthStatus(),
        fetchWalletMonitoring(),
      ]);

      return data;
    } catch (error) {
      console.error('Error running monitoring:', error);
      toast({
        title: 'Error',
        description: 'Failed to run monitoring',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateWalletThreshold = async (walletAddress: string, threshold: number) => {
    try {
      const { error } = await supabase
        .from('wallet_monitoring')
        .update({ alert_threshold: threshold })
        .eq('wallet_address', walletAddress);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Alert threshold updated successfully',
      });

      await fetchWalletMonitoring();
    } catch (error) {
      console.error('Error updating threshold:', error);
      toast({
        title: 'Error',
        description: 'Failed to update alert threshold',
        variant: 'destructive',
      });
    }
  };

  const toggleWalletMonitoring = async (walletAddress: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('wallet_monitoring')
        .update({ is_active: isActive })
        .eq('wallet_address', walletAddress);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Monitoring ${isActive ? 'enabled' : 'disabled'} for wallet`,
      });

      await fetchWalletMonitoring();
    } catch (error) {
      console.error('Error toggling monitoring:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle monitoring',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchAlerts();
    fetchHealthStatus();
    fetchWalletMonitoring();
  }, []);

  return {
    transactions,
    alerts,
    healthStatus,
    walletMonitoring,
    loading,
    runMonitoring,
    updateWalletThreshold,
    toggleWalletMonitoring,
    fetchTransactions,
    fetchAlerts,
    fetchHealthStatus,
    fetchWalletMonitoring,
  };
};