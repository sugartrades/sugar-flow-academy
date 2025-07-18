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

// Exchange addresses with destination tags - EXPANDED
const EXCHANGE_ADDRESSES = {
  // Major exchange hot wallets
  binance: {
    addresses: ['rDsbeomae4FXwgQs4XV4fkKaVpTBLsZy1X', 'rLCdN4oMVNyiQdL6LK2e5SjyVaUqA9BzWq'],
    name: 'Binance',
    tags: ['101391685', '101391686', '101391687', '101391688']
  },
  coinbase: {
    addresses: ['rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh', 'rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg'],
    name: 'Coinbase',
    tags: ['1001', '1002', '1003', '1004', '1005']
  },
  kraken: {
    addresses: ['rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH', 'rBKz5MC2iXdoS3XgnNSYmF69K1Yo4NS3Ws'],
    name: 'Kraken',
    tags: ['2001', '2002', '2003', '2004']
  },
  bitstamp: {
    addresses: ['rLHVsKqC72M8FXPfEwSyYkufezZJvNZuDY', 'rrh7rf1gV2pXAoqA8oYbpHd8TKv5ZQeo67'],
    name: 'Bitstamp',
    tags: ['3001', '3002', '3003', '3004']
  },
  bitfinex: {
    addresses: ['rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w', 'rHdkzHzMHdJq9jNaYQKdJCfYBKvO2HuWaH'],
    name: 'Bitfinex',
    tags: ['570654850', '570654851', '570654852']
  },
  huobi: {
    addresses: ['rUzSNPtxrmeSTpnjsvaTuQvF2SQFPFSvLn', 'rJHygWcTLVpSXziqBkSdGJHWF5BLXgGojM'],
    name: 'Huobi',
    tags: ['4001', '4002', '4003', '4004']
  },
  kucoin: {
    addresses: ['rEhxGqkqPPSxQ3P25J2N1xnhPSPtpHqhvd', 'rPVMhWBsfF9iMXYj3aAzJVkPDTFNSyWdKy'],
    name: 'KuCoin',
    tags: ['5001', '5002', '5003', '5004']
  },
  gatehub: {
    addresses: ['rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf', 'rchGBxcD1A1C2tdxF6papQYZ8kjRKMYcL'],
    name: 'GateHub',
    tags: ['6001', '6002', '6003']
  },
  cryptodotcom: {
    addresses: ['rEb3SrWEyqKkfQfgfTJ9hBTHYGBhT1YX7n', 'rMQ98K56yXJbDGv49ZSmW51sLn94Xe1mu1'],
    name: 'Crypto.com', 
    tags: ['7001', '7002', '7003', '7004']
  },
  pepper: {
    addresses: ['rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY'],
    name: 'Pepper',
    tags: ['8001', '8002', '8003']
  },
  // Additional major exchanges
  okx: {
    addresses: ['rcoreNywaoz2ZCQ8Lg2EbSLnGuRBmun6D', 'rfkE1aSy9G8Upk4JssnwBxhEv5p4mn2KTy'],
    name: 'OKX',
    tags: ['9001', '9002', '9003']
  },
  bybit: {
    addresses: ['rJb5KsHsDHF1YS5B5DU6QCkH5NsPaKX1', 'rN17yc2jnN1BcMqMjdyc6zjdj6j2MKeVG'],
    name: 'Bybit',
    tags: ['10001', '10002', '10003']
  }
};

// Helper functions for exchange detection
function getExchangeInfo(address: string, destinationTag?: string) {
  // Check each exchange for matching address
  for (const [exchangeKey, exchangeData] of Object.entries(EXCHANGE_ADDRESSES)) {
    if (exchangeData.addresses.includes(address)) {
      // If destination tag provided, verify it's valid for this exchange
      if (destinationTag && exchangeData.tags.includes(destinationTag)) {
        return {
          exchange: exchangeData.name,
          destinationTag: destinationTag,
          verified: true
        };
      } else if (!destinationTag) {
        // Address matches but no destination tag
        return {
          exchange: exchangeData.name,
          destinationTag: null,
          verified: false
        };
      }
    }
  }
  return null;
}

function isExchangeAddress(address: string) {
  return Object.values(EXCHANGE_ADDRESSES).some(exchange => 
    exchange.addresses.includes(address)
  );
}

function getAllExchangeAddresses() {
  const allAddresses = [];
  for (const exchange of Object.values(EXCHANGE_ADDRESSES)) {
    allAddresses.push(...exchange.addresses);
  }
  return allAddresses;
}

async function makeXRPLRequest(endpoint: string, method: string, params: any, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
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

      if (response.status === 429) {
        // Rate limited, wait longer before retrying
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
        console.log(`Rate limited by ${endpoint}, waiting ${waitTime}ms before retry ${attempt}/${retries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        throw new Error(`XRPL API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check for XRPL protocol errors
      if (data.result && data.result.error) {
        throw new Error(`XRPL Error: ${data.result.error} - ${data.result.error_message || ''}`);
      }

      return data;
    } catch (error) {
      console.error(`Attempt ${attempt}/${retries} failed for ${endpoint}:`, error.message);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retrying (progressive delay)
      const waitTime = 500 * attempt;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

async function getWalletTransactions(address: string, limit: number = 50, lastLedgerIndex?: number): Promise<Transaction[]> {
  // Add delay between endpoint attempts to avoid rate limiting
  let lastEndpointTime = 0;
  
  for (let i = 0; i < XRPL_ENDPOINTS.length; i++) {
    const endpoint = XRPL_ENDPOINTS[i];
    
    // Add 200ms delay between different endpoint calls
    if (i > 0) {
      const timeSinceLastCall = Date.now() - lastEndpointTime;
      if (timeSinceLastCall < 200) {
        await new Promise(resolve => setTimeout(resolve, 200 - timeSinceLastCall));
      }
    }
    
    try {
      console.log(`Fetching transactions for ${address} from ${endpoint}${lastLedgerIndex ? ` starting from ledger ${lastLedgerIndex + 1}` : ''}`);
      lastEndpointTime = Date.now();
      
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
      } else if (response.result && response.result.account === address) {
        // Valid account but no transactions
        return [];
      }
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error.message);
      
      // If this looks like an invalid account error, don't try other endpoints
      if (error.message.includes('actNotFound') || error.message.includes('Account not found')) {
        throw new Error(`Invalid wallet address: ${address}`);
      }
      
      continue;
    }
  }
  throw new Error("All XRPL endpoints failed");
}

async function getWalletBalance(address: string): Promise<string> {
  // Add delay between endpoint attempts to avoid rate limiting
  let lastEndpointTime = 0;
  
  for (let i = 0; i < XRPL_ENDPOINTS.length; i++) {
    const endpoint = XRPL_ENDPOINTS[i];
    
    // Add 200ms delay between different endpoint calls
    if (i > 0) {
      const timeSinceLastCall = Date.now() - lastEndpointTime;
      if (timeSinceLastCall < 200) {
        await new Promise(resolve => setTimeout(resolve, 200 - timeSinceLastCall));
      }
    }
    
    try {
      lastEndpointTime = Date.now();
      const response = await makeXRPLRequest(endpoint, "account_info", {
        account: address,
      });

      if (response.result && response.result.account_data) {
        const balance = parseInt(response.result.account_data.Balance) / 1000000;
        return balance.toString();
      }
    } catch (error) {
      console.error(`Error fetching balance from ${endpoint}:`, error.message);
      
      // If this looks like an invalid account error, don't try other endpoints
      if (error.message.includes('actNotFound') || error.message.includes('Account not found')) {
        throw new Error(`Invalid wallet address: ${address}`);
      }
      
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
      getExchangeInfo(tx.destination, tx.destination_tag) : 
      (tx.destination ? getExchangeInfo(tx.destination) : null);
    
    let threshold = defaultThreshold;
    let alertType = "whale_movement";
    let alertCategory = "whale_movement";
    
    // Determine alert type and category based on transaction characteristics
    if (exchangeInfo && exchangeInfo.verified) {
      // Verified exchange deposit with destination tag
      threshold = Math.max(50000, defaultThreshold * 0.8); // Slightly lower threshold for verified deposits
      alertType = "exchange_deposit";
      alertCategory = "exchange_deposit";
      console.log(`🏦 Verified exchange deposit: ${amount} XRP to ${exchangeInfo.exchange} with tag ${exchangeInfo.destinationTag}`);
    } else if (exchangeInfo && !exchangeInfo.verified) {
      // Exchange address but no/invalid destination tag
      threshold = Math.max(100000, defaultThreshold); // Higher threshold for unverified
      alertType = "exchange_transfer";
      alertCategory = "exchange_transfer"; 
      console.log(`🏦 Unverified exchange transfer: ${amount} XRP to ${exchangeInfo.exchange} (no valid destination tag)`);
    } else if (isExchangeAddress(tx.destination || '')) {
      // Known exchange address but no destination tag info
      threshold = Math.max(150000, defaultThreshold * 1.2);
      alertType = "exchange_transfer";
      alertCategory = "exchange_transfer";
      console.log(`🏦 Exchange transfer: ${amount} XRP to known exchange address`);
    } else {
      // Regular whale movement
      console.log(`🐋 Checking whale movement: ${amount} XRP (threshold: ${threshold})`);
    }
    
    if (amount >= threshold) {
      const alertMessage = exchangeInfo ? 
        `🏦 NEW ${exchangeInfo.verified ? 'Verified' : 'Unverified'} Exchange ${alertType}! ${ownerName} - ${amount} XRP to ${exchangeInfo.exchange} (Ledger: ${tx.ledger_index})` :
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
        } else {
          console.log(`✅ Created ${alertCategory} alert for ${amount} XRP`);
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
    
    // Validate wallet address format
    if (!address || !address.startsWith('r') || address.length < 25 || address.length > 35) {
      throw new Error(`Invalid wallet address format: ${address}`);
    }
    
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
      lastLedgerIndex = currentLedger || 97000000; // Updated to a more recent baseline
      
      // Update the wallet monitoring record
      await supabase
        .from('wallet_monitoring')
        .update({ last_ledger_index: lastLedgerIndex })
        .eq('wallet_address', address);
    }
    
    console.log(`Last checked ledger index: ${lastLedgerIndex}`);

    // Add small delay before making API calls to prevent overwhelming endpoints
    await new Promise(resolve => setTimeout(resolve, 100));

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
    console.error(`Error monitoring ${address}:`, error.message);
    await updateMonitoringHealth(`wallet_monitor_${address}`, "error", responseTime, error.message);
    
    // For invalid wallet addresses, we should consider disabling monitoring
    if (error.message.includes('Invalid wallet address')) {
      console.log(`Disabling monitoring for invalid wallet: ${address}`);
      await supabase
        .from('wallet_monitoring')
        .update({ is_active: false })
        .eq('wallet_address', address);
    }
    
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