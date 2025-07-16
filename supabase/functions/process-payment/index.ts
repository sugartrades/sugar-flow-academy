import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Xaman API configuration
const XAMAN_API_KEY = Deno.env.get("XAMAN_API_KEY")!;
const XAMAN_API_SECRET = Deno.env.get("XAMAN_API_SECRET")!;
const XAMAN_BASE_URL = "https://xumm.app/api/v1/platform";

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

// Helper function to convert string to hex
function stringToHex(str: string): string {
  return new TextEncoder().encode(str).reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0'), '').toUpperCase();
}

// Helper function to make authenticated Xaman API requests
async function makeXamanRequest(endpoint: string, method: string, body?: any) {
  const headers = {
    "Content-Type": "application/json",
    "X-API-Key": XAMAN_API_KEY,
    "X-API-Secret": XAMAN_API_SECRET,
  };

  const response = await fetch(`${XAMAN_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Xaman API request failed: ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

async function createPaymentRequest(email: string, amount: number, destinationAddress: string, origin?: string) {
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

  // Create Xaman payment request using the official API
  const xamanPayload = {
    TransactionType: "Payment",
    Destination: destinationAddress,
    Amount: (amount * 1000000).toString(), // Convert XRP to drops
    Memos: [
      {
        Memo: {
          MemoType: stringToHex("Description"),
          MemoData: stringToHex("Whale Alert Pro - Lifetime Access")
        }
      }
    ]
  };

  console.log("Creating Xaman payment request:", xamanPayload);

  // Use dynamic return URL based on origin or fallback to production
  const baseUrl = origin || "https://sugartrades.io";
  
  const xamanResponse = await makeXamanRequest("/payload", "POST", {
    txjson: xamanPayload,
    options: {
      submit: true,
      multisign: false,
      expire: 1440, // 24 hours in minutes
      return_url: {
        web: `${baseUrl}/success?payment=${paymentRequest.id}`,
        app: `${baseUrl}/success?payment=${paymentRequest.id}`
      }
    }
  });

  // Store the Xaman request ID in the database
  await supabase
    .from("payment_requests")
    .update({ xaman_request_id: xamanResponse.uuid })
    .eq("id", paymentRequest.id);

  return {
    paymentId: paymentRequest.id,
    xamanUrl: xamanResponse.next.always,
    xamanRequestId: xamanResponse.uuid,
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

  // First check Xaman API if we have a request ID
  if (paymentRequest.xaman_request_id) {
    try {
      const xamanStatus = await makeXamanRequest(`/payload/${paymentRequest.xaman_request_id}`, "GET");
      
      if (xamanStatus.meta.signed && xamanStatus.meta.submit) {
        // Payment was signed and submitted, check if it was successful
        if (xamanStatus.response.dispatched_result === "tesSUCCESS") {
          const transactionHash = xamanStatus.response.txid;
          const ledgerIndex = xamanStatus.response.dispatched_to;
          
          // Update payment request status
          await supabase
            .from("payment_requests")
            .update({
              status: "completed",
              transaction_hash: transactionHash,
              ledger_index: ledgerIndex
            })
            .eq("id", paymentId);

          // Send confirmation email and Telegram alert
          try {
            await supabase.functions.invoke("send-payment-confirmation", {
              body: {
                email: paymentRequest.email,
                amount: paymentRequest.amount,
                transactionHash: transactionHash,
                paymentId: paymentId
              }
            });
            console.log("Payment confirmation email sent successfully");
          } catch (error) {
            console.error("Error sending payment confirmation:", error);
          }

          return {
            status: "completed",
            transactionHash,
            ledgerIndex,
            amount: paymentRequest.amount
          };
        } else if (xamanStatus.response.dispatched_result) {
          // Payment was submitted but failed
          await supabase
            .from("payment_requests")
            .update({ status: "failed" })
            .eq("id", paymentId);

          return {
            status: "failed",
            error: `Transaction failed: ${xamanStatus.response.dispatched_result}`
          };
        }
      } else if (xamanStatus.meta.cancelled) {
        // Payment was cancelled
        await supabase
          .from("payment_requests")
          .update({ status: "failed" })
          .eq("id", paymentId);

        return {
          status: "failed",
          error: "Payment was cancelled"
        };
      } else if (xamanStatus.meta.expired) {
        // Payment expired
        await supabase
          .from("payment_requests")
          .update({ status: "expired" })
          .eq("id", paymentId);

        return {
          status: "expired",
          error: "Payment request expired"
        };
      }
    } catch (error) {
      console.error("Error checking Xaman status:", error);
      // Fall back to XRPL verification
    }
  }

  // Fallback: Check XRPL for payment
  const createdAt = new Date(paymentRequest.created_at);
  const payment = await verifyPayment(
    paymentRequest.destination_address,
    paymentRequest.amount,
    createdAt
  );

  if (payment) {
    // Check if confirmation email was already sent to prevent duplicates
    const { data: existingRequest } = await supabase
      .from("payment_requests")
      .select("status")
      .eq("id", paymentId)
      .single();
    
    // Only send email if status wasn't already "completed" (prevents duplicates)
    if (existingRequest?.status !== "completed") {
      // Update payment request status
      await supabase
        .from("payment_requests")
        .update({
          status: "completed",
          transaction_hash: payment.hash,
          ledger_index: payment.ledger_index
        })
        .eq("id", paymentId);
      try {
        await supabase.functions.invoke("send-payment-confirmation", {
          body: {
            email: paymentRequest.email,
            amount: paymentRequest.amount,
            transactionHash: payment.hash,
            paymentId: paymentId
          }
        });
        console.log("Payment confirmation email sent successfully (XRPL fallback)");
      } catch (error) {
        console.error("Error sending payment confirmation:", error);
      }
    } else {
      console.log("Confirmation email already sent, skipping duplicate");
    }

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
    console.log("Processing request:", req.method, req.url);
    
    // Check if required environment variables are present
    const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "XAMAN_API_KEY", "XAMAN_API_SECRET"];
    const missingEnvVars = requiredEnvVars.filter(varName => !Deno.env.get(varName));
    
    if (missingEnvVars.length > 0) {
      console.error("Missing environment variables:", missingEnvVars);
      return new Response(
        JSON.stringify({ error: `Missing environment variables: ${missingEnvVars.join(', ')}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestBody = await req.json();
    console.log("Request body:", requestBody);
    
    const { action, ...params } = requestBody;

    if (action === "create_payment") {
      const { email, amount, destinationAddress } = params as PaymentRequest;
      
      console.log("Creating payment request for:", email, amount, destinationAddress);
      
      if (!email || !amount || !destinationAddress) {
        console.error("Missing required fields:", { email, amount, destinationAddress });
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get origin from request headers
      const origin = req.headers.get("origin") || req.headers.get("referer")?.split("/").slice(0, 3).join("/");
      console.log("Origin detected:", origin);
      
      const result = await createPaymentRequest(email, amount, destinationAddress, origin);
      console.log("Payment request created:", result);
      
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
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check edge function logs for more information"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});