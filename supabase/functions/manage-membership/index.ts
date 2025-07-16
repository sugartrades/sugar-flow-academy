import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GrantAccessRequest {
  email: string;
  paymentId: string;
  tier: 'pro' | 'premium';
}

interface CheckAccessRequest {
  email: string;
}

async function findUserByEmail(email: string) {
  // First check if user exists in auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
    return null;
  }

  const authUser = authUsers.users.find(user => user.email === email);
  
  if (authUser) {
    return authUser;
  }

  return null;
}

async function createUserProfile(userId: string, email: string) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: email.split('@')[0], // Use email prefix as default name
      username: email.split('@')[0],
    })
    .select()
    .single();

  if (error && !error.message.includes('duplicate key')) {
    console.error('Error creating user profile:', error);
    throw error;
  }

  return data;
}

async function grantMembershipAccess(email: string, paymentId: string, tier: 'pro' | 'premium') {
  try {
    // Verify the payment was successful
    const { data: payment, error: paymentError } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', paymentId)
      .eq('email', email)
      .eq('status', 'completed')
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment verification failed');
    }

    // Check if user exists
    const authUser = await findUserByEmail(email);
    
    if (!authUser) {
      // For now, we'll create a pending membership that can be claimed later
      console.log(`User ${email} doesn't exist yet, creating pending membership`);
      
      // Create a pending membership record that can be claimed when user signs up
      const { error: pendingError } = await supabase
        .from('user_memberships')
        .upsert({
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID for pending
          tier,
          is_purchased: true,
          granted_at: new Date().toISOString(),
        });

      if (pendingError) {
        console.error('Error creating pending membership:', pendingError);
        throw new Error('Failed to create pending membership');
      }

      return {
        success: true,
        message: 'Membership granted. Please sign up to activate your access.',
        pending: true
      };
    }

    // User exists, grant immediate access
    await createUserProfile(authUser.id, email);

    // Grant or update membership
    const { error: membershipError } = await supabase
      .from('user_memberships')
      .upsert({
        user_id: authUser.id,
        tier,
        is_purchased: true,
        granted_at: new Date().toISOString(),
      });

    if (membershipError) {
      console.error('Error granting membership:', membershipError);
      throw new Error('Failed to grant membership');
    }

    return {
      success: true,
      message: 'Membership activated successfully!',
      pending: false
    };

  } catch (error) {
    console.error('Error granting membership access:', error);
    throw error;
  }
}

async function checkUserAccess(email: string) {
  try {
    const authUser = await findUserByEmail(email);
    
    if (!authUser) {
      return {
        hasAccess: false,
        message: 'User not found. Please sign up first.'
      };
    }

    // Check current membership
    const { data: membership, error } = await supabase
      .from('user_memberships')
      .select('*')
      .eq('user_id', authUser.id)
      .order('granted_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    if (!membership) {
      return {
        hasAccess: false,
        tier: 'free',
        message: 'No active membership found.'
      };
    }

    return {
      hasAccess: membership.tier !== 'free',
      tier: membership.tier,
      isPurchased: membership.is_purchased,
      grantedAt: membership.granted_at,
      message: membership.tier === 'free' ? 'Free tier access' : `Active ${membership.tier} membership`
    };

  } catch (error) {
    console.error('Error checking user access:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    if (action === "grant_access") {
      const { email, paymentId, tier = 'pro' } = params as GrantAccessRequest;
      
      if (!email || !paymentId) {
        return new Response(
          JSON.stringify({ error: "Email and payment ID are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await grantMembershipAccess(email, paymentId, tier);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "check_access") {
      const { email } = params as CheckAccessRequest;
      
      if (!email) {
        return new Response(
          JSON.stringify({ error: "Email is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await checkUserAccess(email);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in manage-membership function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});