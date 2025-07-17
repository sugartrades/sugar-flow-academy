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
  destination_tag?: string;
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

// Exchange addresses with destination tags
const EXCHANGE_ADDRESSES = {
  arthurBritto: {
    name: "Arthur Britto",
    exchanges: [
      {
        address: "rDfrrrBJZshSQDvfT2kmL9oUBdish52unH",
        exchange: "Binance",
        destinationTag: "101391685"
      },
      {
        address: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
        exchange: "Bitfinex", 
        destinationTag: "570654850"
      },
      {
        address: "rLHVsKqC72M8FXPfEwSyYkufezZJvNZuDY",
        exchange: "Bitstamp",
        destinationTag: "1234567890"
      }
    ]
  },
  chrisLarsen: {
    name: "Chris Larsen",
    exchanges: [
      {
        address: "rDfrrrBJZshSQDvfT2kmL9oUBdish52unH",
        exchange: "Binance",
        destinationTag: "101391686"
      },
      {
        address: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
        exchange: "Bitfinex",
        destinationTag: "570654851"
      },
      {
        address: "rLHVsKqC72M8FXPfEwSyYkufezZJvNZuDY",
        exchange: "Bitstamp",
        destinationTag: "1234567891"
      }
    ]
  }
};

// Helper functions for exchange detection
function getExchangeInfo(address: string, destinationTag?: string) {
  for (const [owner, data] of Object.entries(EXCHANGE_ADDRESSES)) {
    const exchange = data.exchanges.find(ex => 
      ex.address === address && ex.destinationTag === destinationTag
    );
    if (exchange) {
      return {
        owner: data.name,
        exchange: exchange.exchange,
        destinationTag: exchange.destinationTag
      };
    }
  }
  return null;
}

function isExchangeAddress(address: string) {
  return Object.values(EXCHANGE_ADDRESSES).some(data => 
    data.exchanges.some(ex => ex.address === address)
  );
}

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
          destination_tag: tx.tx.DestinationTag ? tx.tx.DestinationTag.toString() : undefined,
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
      // Check if this is an exchange deposit
      const exchangeInfo = tx.destination && tx.destination_tag ? 
        getExchangeInfo(tx.destination, tx.destination_tag) : null;

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
          destination_tag: tx.destination_tag,
          exchange_name: exchangeInfo?.exchange,
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

  const defaultThreshold = monitoringData?.alert_threshold || 50000;

  for (const tx of transactions) {
    // Only process transactions newer than the last checked ledger index
    if (lastLedgerIndex && tx.ledger_index <= lastLedgerIndex) {
      continue;
    }

    const amount = parseFloat(tx.amount);
    
    // Check if this is an exchange deposit
    const exchangeInfo = tx.destination && tx.destination_tag ? 
      getExchangeInfo(tx.destination, tx.destination_tag) : null;
    
    let threshold = defaultThreshold;
    let alertType = "whale_movement";
    let alertCategory = "whale_movement";
    
    // Use different thresholds for exchange deposits
    if (exchangeInfo) {
      threshold = 50000; // Higher threshold for exchange deposits
      alertType = "exchange_deposit";
      alertCategory = "exchange_deposit";
      console.log(`🏦 Checking exchange deposit: ${amount} XRP to ${exchangeInfo.exchange} (threshold: ${threshold})`);
    }
    
    if (amount >= threshold) {
      const alertMessage = exchangeInfo ? 
        `🏦 NEW Exchange deposit! ${ownerName} - ${amount} XRP to ${exchangeInfo.exchange} (Ledger: ${tx.ledger_index})` :
        `🐋 NEW Whale alert! ${ownerName} - ${amount} XRP (Ledger: ${tx.ledger_index})`;
      
      console.log(alertMessage);
      
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
            alert_type: alertType,
            alert_category: alertCategory,
            destination_tag: tx.destination_tag,
            exchange_name: exchangeInfo?.exchange,
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
    
    // Get wallet monitoring info to determine last checked ledger
    const { data: monitoringData } = await supabase
      .from("wallet_monitoring")
      .select("last_ledger_index")
      .eq("wallet_address", address)
      .single();

    let lastLedgerIndex = monitoringData?.last_ledger_index;
    
    // Safety check: If last_ledger_index is still null, initialize it properly
    if (!lastLedgerIndex) {
      console.log('Initializing last_ledger_index for first-time setup');
      // Get current ledger index from database function
      const { data: currentLedger } = await supabase.rpc('get_current_ledger_index');
      lastLedgerIndex = currentLedger || 89500000;
      
      // Update the wallet monitoring record
      await supabase
        .from('wallet_monitoring')
        .update({ last_ledger_index: lastLedgerIndex })
        .eq('wallet_address', address);
    }
    
    console.log(`Last checked ledger index: ${lastLedgerIndex}`);

    const [transactions, balance] = await Promise.all([
      getWalletTransactions(address, 50, lastLedgerIndex),
      getWalletBalance(address),
    ]);

    console.log(`Found ${transactions.length} transactions total`);
    
    // Filter out any transactions that are older than our last checked ledger
    const newTransactions = transactions.filter(tx => tx.ledger_index > lastLedgerIndex);
    console.log(`Found ${newTransactions.length} transactions since last check`);

    // Only process new transactions
    if (newTransactions.length > 0) {
      // Store transactions in database
      await storeTransactions(address, newTransactions);

      // Check for whale alerts only on NEW transactions
      await checkForWhaleAlerts(address, ownerName, newTransactions, lastLedgerIndex);

      // Update the last checked ledger index using the safe update function
      const highestLedgerIndex = Math.max(...newTransactions.map(tx => tx.ledger_index));
      await supabase.rpc('update_wallet_last_ledger_index', {
        p_wallet_address: address,
        p_new_ledger_index: highestLedgerIndex
      });
    } else {
      console.log('Found 0 transactions since last check');
      // Update last_checked_at even if no new transactions
      await supabase
        .from('wallet_monitoring')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('wallet_address', address);
    }

    const responseTime = Date.now() - startTime;
    await updateMonitoringHealth(`wallet_monitor_${address}`, "healthy", responseTime);

    return {
      address,
      owner_name: ownerName,
      transactions: newTransactions, // Return only new transactions
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