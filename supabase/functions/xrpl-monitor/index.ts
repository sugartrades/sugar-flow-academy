import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Transaction {
  hash: string;
  date: string;
  type: string;
  amount: string;
  currency: string;
  destination?: string;
  source?: string;
  ledger_index: number;
}

interface WalletData {
  address: string;
  owner_name: string;
  transactions: Transaction[];
  balance: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// XRPL API endpoints
const XRPL_ENDPOINTS = [
  "https://xrplcluster.com",
  "https://s1.ripple.com:51234",
  "https://s2.ripple.com:51234"
];

async function makeXRPLRequest(endpoint: string, method: string, params: any) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method,
      params: [params],
    }),
  });

  if (!response.ok) {
    throw new Error(`XRPL API request failed: ${response.statusText}`);
  }

  return await response.json();
}

async function getWalletTransactions(address: string, limit: number = 50, lastLedgerIndex?: number): Promise<Transaction[]> {
  for (const endpoint of XRPL_ENDPOINTS) {
    try {
      console.log(`Fetching transactions for ${address} from ${endpoint}${lastLedgerIndex ? ` starting from ledger ${lastLedgerIndex + 1}` : ''}`);
      
      const response = await makeXRPLRequest(endpoint, "account_tx", {
        account: address,
        limit,
        ledger_index_min: lastLedgerIndex ? lastLedgerIndex + 1 : -1,
        ledger_index_max: -1,
      });

      if (response.result && response.result.transactions) {
        return response.result.transactions.map((tx: any) => ({
          hash: tx.tx.hash,
          date: new Date((tx.tx.date + 946684800) * 1000).toISOString(),
          type: tx.tx.TransactionType === "Payment" ? 
            (tx.tx.Account === address ? "sent" : "received") : tx.tx.TransactionType,
          amount: tx.tx.Amount ? 
            (typeof tx.tx.Amount === "string" ? 
              (parseInt(tx.tx.Amount) / 1000000).toString() : 
              tx.tx.Amount.value) : "0",
          currency: tx.tx.Amount ? 
            (typeof tx.tx.Amount === "string" ? "XRP" : tx.tx.Amount.currency) : "XRP",
          destination: tx.tx.Destination,
          source: tx.tx.Account,
          ledger_index: tx.tx.ledger_index || tx.ledger_index,
        }));
      }
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      continue;
    }
  }
  throw new Error("All XRPL endpoints failed");
}

async function getWalletBalance(address: string): Promise<string> {
  for (const endpoint of XRPL_ENDPOINTS) {
    try {
      const response = await makeXRPLRequest(endpoint, "account_info", {
        account: address,
      });

      if (response.result && response.result.account_data) {
        const balance = parseInt(response.result.account_data.Balance) / 1000000;
        return balance.toString();
      }
    } catch (error) {
      console.error(`Error fetching balance from ${endpoint}:`, error);
      continue;
    }
  }
  throw new Error("All XRPL endpoints failed for balance");
}

async function storeTransactions(walletAddress: string, transactions: Transaction[]) {
  for (const tx of transactions) {
    try {
      const { error } = await supabase
        .from("wallet_transactions")
        .upsert({
          wallet_address: walletAddress,
          transaction_hash: tx.hash,
          amount: parseFloat(tx.amount),
          currency: tx.currency,
          transaction_type: tx.type,
          destination_address: tx.destination,
          source_address: tx.source,
          ledger_index: tx.ledger_index,
          transaction_date: tx.date,
        });

      if (error && !error.message.includes("duplicate key")) {
        console.error("Error storing transaction:", error);
      }
    } catch (error) {
      console.error("Error storing transaction:", error);
    }
  }
}

async function checkForWhaleAlerts(walletAddress: string, ownerName: string, transactions: Transaction[], lastLedgerIndex?: number) {
  const { data: monitoringData } = await supabase
    .from("wallet_monitoring")
    .select("alert_threshold")
    .eq("wallet_address", walletAddress)
    .single();

  const threshold = monitoringData?.alert_threshold || 50000;

  for (const tx of transactions) {
    // Only process transactions newer than the last checked ledger index
    if (lastLedgerIndex && tx.ledger_index <= lastLedgerIndex) {
      continue;
    }

    const amount = parseFloat(tx.amount);
    if (amount >= threshold) {
      console.log(`🐋 NEW Whale alert! ${ownerName} - ${amount} XRP (Ledger: ${tx.ledger_index})`);
      
      // Check if we already have this alert to prevent duplicates
      const { data: existingAlert } = await supabase
        .from("whale_alerts")
        .select("id")
        .eq("transaction_hash", tx.hash)
        .single();

      if (!existingAlert) {
        const { error } = await supabase
          .from("whale_alerts")
          .insert({
            wallet_address: walletAddress,
            owner_name: ownerName,
            transaction_hash: tx.hash,
            amount,
            transaction_type: tx.type,
            alert_type: "whale_movement",
          });

        if (error) {
          console.error("Error creating whale alert:", error);
        }
      } else {
        console.log(`Alert already exists for transaction ${tx.hash}, skipping`);
      }
    }
  }
}

async function updateMonitoringHealth(serviceName: string, status: string, responseTime: number, errorMessage?: string) {
  const { error } = await supabase
    .from("monitoring_health")
    .insert({
      service_name: serviceName,
      status,
      response_time_ms: responseTime,
      error_message: errorMessage,
    });

  if (error) {
    console.error("Error updating monitoring health:", error);
  }
}

async function monitorWallet(address: string, ownerName: string): Promise<WalletData> {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 Monitoring wallet ${address} (${ownerName})`);
    
    // Get the last checked ledger index to only process NEW transactions
    const { data: monitoringData } = await supabase
      .from("wallet_monitoring")
      .select("last_ledger_index")
      .eq("wallet_address", address)
      .single();

    const lastLedgerIndex = monitoringData?.last_ledger_index;
    console.log(`Last checked ledger index: ${lastLedgerIndex || 'none'}`);

    const [transactions, balance] = await Promise.all([
      getWalletTransactions(address, 100, lastLedgerIndex),
      getWalletBalance(address),
    ]);

    console.log(`Found ${transactions.length} transactions ${lastLedgerIndex ? 'since last check' : 'total'}`);

    // Store transactions in database
    await storeTransactions(address, transactions);

    // Check for whale alerts only on NEW transactions
    await checkForWhaleAlerts(address, ownerName, transactions, lastLedgerIndex);

    // Update monitoring status
    const { error } = await supabase
      .from("wallet_monitoring")
      .update({
        last_checked_at: new Date().toISOString(),
        last_ledger_index: transactions[0]?.ledger_index || null,
      })
      .eq("wallet_address", address);

    if (error) {
      console.error("Error updating monitoring status:", error);
    }

    const responseTime = Date.now() - startTime;
    await updateMonitoringHealth(`wallet_monitor_${address}`, "healthy", responseTime);

    return {
      address,
      owner_name: ownerName,
      transactions,
      balance,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await updateMonitoringHealth(`wallet_monitor_${address}`, "error", responseTime, error.message);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, walletAddress, ownerName } = await req.json();

    if (action === "monitor_single") {
      const result = await monitorWallet(walletAddress, ownerName);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "monitor_all") {
      const { data: wallets } = await supabase
        .from("wallet_monitoring")
        .select("wallet_address, owner_name")
        .eq("is_active", true);

      const results = [];
      for (const wallet of wallets || []) {
        try {
          const result = await monitorWallet(wallet.wallet_address, wallet.owner_name);
          results.push(result);
        } catch (error) {
          console.error(`Error monitoring ${wallet.wallet_address}:`, error);
          results.push({
            address: wallet.wallet_address,
            owner_name: wallet.owner_name,
            error: error.message,
          });
        }
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "health_check") {
      const { data: health } = await supabase
        .from("monitoring_health")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      return new Response(JSON.stringify({ health }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in xrpl-monitor function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});