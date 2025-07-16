import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// XRPL endpoints for payment verification
const XRPL_ENDPOINTS = [
  "https://xrplcluster.com",
  "https://s1.ripple.com:51234",
  "https://s2.ripple.com:51234"
];

interface PaymentRequest {
  email: string;
  amount: number;
  destinationAddress: string;
}

interface PaymentStatusRequest {
  paymentId: string;
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

async function verifyPayment(destinationAddress: string, expectedAmount: number, afterTime: Date): Promise<any> {
  for (const endpoint of XRPL_ENDPOINTS) {
    try {
      console.log(`Checking payments to ${destinationAddress} from ${endpoint}`);
      
      const response = await makeXRPLRequest(endpoint, "account_tx", {
        account: destinationAddress,
        limit: 50,
        ledger_index_min: -1,
        ledger_index_max: -1,
      });

      if (response.result && response.result.transactions) {
        const transactions = response.result.transactions;
        
        // Look for incoming payments after the request was created
        for (const tx of transactions) {
          const transaction = tx.tx;
          const transactionDate = new Date((transaction.date + 946684800) * 1000);
          
          if (
            transaction.TransactionType === "Payment" &&
            transaction.Destination === destinationAddress &&
            transactionDate > afterTime &&
            typeof transaction.Amount === "string"
          ) {
            const amount = parseInt(transaction.Amount) / 1000000; // Convert drops to XRP
            
            if (Math.abs(amount - expectedAmount) < 0.001) { // Allow for small differences
              return {
                hash: transaction.hash,
                amount: amount,
                source: transaction.Account,
                ledger_index: transaction.ledger_index || tx.ledger_index,
                date: transactionDate.toISOString(),
                validated: tx.validated || false
              };
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error checking payments from ${endpoint}:`, error);
      continue;
    }
  }
  
  return null;
}

async function createPaymentRequest(email: string, amount: number, destinationAddress: string) {
  // Create payment request in database
  const { data: paymentRequest, error } = await supabase
    .from("payment_requests")
    .insert({
      email,
      amount,
      destination_address: destinationAddress,
      status: "pending",
      currency: "XRP"
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payment request: ${error.message}`);
  }

  // Create Xaman payment request
  const xamanPayload = {
    TransactionType: "Payment",
    Destination: destinationAddress,
    Amount: (amount * 1000000).toString(), // Convert XRP to drops
    Memo: {
      MemoType: Buffer.from("Description").toString("hex").toUpperCase(),
      MemoData: Buffer.from("Whale Alert Pro - Lifetime Access").toString("hex").toUpperCase()
    }
  };

  // For now, create a simple payment URL since we don't have Xaman API keys
  // In production, this would use the Xaman SDK to create a proper payment request
  const xamanUrl = `https://xumm.app/sign/${encodeURIComponent(JSON.stringify(xamanPayload))}`;

  return {
    paymentId: paymentRequest.id,
    xamanUrl,
    amount,
    destinationAddress
  };
}

async function checkPaymentStatus(paymentId: string) {
  // Get payment request from database
  const { data: paymentRequest, error } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (error) {
    throw new Error(`Payment request not found: ${error.message}`);
  }

  if (paymentRequest.status === "completed") {
    return {
      status: "completed",
      transactionHash: paymentRequest.transaction_hash,
      ledgerIndex: paymentRequest.ledger_index
    };
  }

  if (paymentRequest.status === "failed") {
    return {
      status: "failed",
      error: "Payment failed"
    };
  }

  // Check if payment has expired
  const expiresAt = new Date(paymentRequest.expires_at);
  if (new Date() > expiresAt) {
    await supabase
      .from("payment_requests")
      .update({ status: "expired" })
      .eq("id", paymentId);

    return {
      status: "expired",
      error: "Payment request expired"
    };
  }

  // Check XRPL for payment
  const createdAt = new Date(paymentRequest.created_at);
  const payment = await verifyPayment(
    paymentRequest.destination_address,
    paymentRequest.amount,
    createdAt
  );

  if (payment) {
    // Update payment request status
    await supabase
      .from("payment_requests")
      .update({
        status: "completed",
        transaction_hash: payment.hash,
        ledger_index: payment.ledger_index
      })
      .eq("id", paymentId);

    return {
      status: "completed",
      transactionHash: payment.hash,
      ledgerIndex: payment.ledger_index,
      amount: payment.amount
    };
  }

  return {
    status: "pending",
    expiresAt: paymentRequest.expires_at
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    if (action === "create_payment") {
      const { email, amount, destinationAddress } = params as PaymentRequest;
      
      if (!email || !amount || !destinationAddress) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await createPaymentRequest(email, amount, destinationAddress);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "check_payment") {
      const { paymentId } = params as PaymentStatusRequest;
      
      if (!paymentId) {
        return new Response(
          JSON.stringify({ error: "Payment ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await checkPaymentStatus(paymentId);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in process-payment function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});