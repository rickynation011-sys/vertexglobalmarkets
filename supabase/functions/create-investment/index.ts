import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLANS: Record<string, { min: number; max: number; duration: number; annualRate: number }> = {
  "Conservative Growth": { min: 500, max: 50000, duration: 30, annualRate: 5 },
  "Balanced Portfolio": { min: 2000, max: 100000, duration: 30, annualRate: 7.5 },
  "Aggressive Alpha": { min: 5000, max: 200000, duration: 30, annualRate: 10 },
  "Forex Specialist": { min: 1000, max: 75000, duration: 30, annualRate: 6.5 },
  "Crypto Momentum": { min: 1500, max: 100000, duration: 30, annualRate: 9.5 },
  "Real Estate Income": { min: 2500, max: 150000, duration: 90, annualRate: 8 },
  "VIP Elite": { min: 25000, max: 1000000, duration: 30, annualRate: 12.5 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client to get user identity
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Service client for privileged operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const planName = typeof body.plan_name === "string" ? body.plan_name.trim() : "";
    const amount = typeof body.amount === "number" ? body.amount : NaN;

    // Validate plan
    const plan = PLANS[planName];
    if (!plan) {
      return new Response(JSON.stringify({ error: "Invalid investment plan." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid investment amount." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (amount < plan.min) {
      return new Response(JSON.stringify({ error: `Minimum investment for ${planName} is $${plan.min.toLocaleString()}.` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (amount > plan.max) {
      return new Response(JSON.stringify({ error: `Maximum investment for ${planName} is $${plan.max.toLocaleString()}.` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch user profile balance
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("wallet_balance")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Could not fetch account balance." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const balance = Number(profile.wallet_balance);

    if (balance <= 0) {
      return new Response(JSON.stringify({ error: "NO_BALANCE", message: "You need to fund your account before purchasing an investment plan." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (balance < amount) {
      return new Response(JSON.stringify({ error: "INSUFFICIENT_BALANCE", message: `Insufficient balance. You have $${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })} but need $${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}.` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Deduct balance
    const newBalance = balance - amount;
    const { error: balanceError } = await adminClient
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("user_id", user.id);

    if (balanceError) {
      return new Response(JSON.stringify({ error: "Failed to deduct balance. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create investment
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + plan.duration);

    const { data: investment, error: investError } = await adminClient
      .from("investments")
      .insert({
        user_id: user.id,
        plan_name: planName,
        amount: amount,
        current_value: amount,
        return_pct: 0,
        daily_rate: plan.annualRate,
        status: "active",
        ends_at: endsAt.toISOString(),
      })
      .select("id")
      .single();

    if (investError) {
      // Rollback balance
      await adminClient.from("profiles").update({ wallet_balance: balance }).eq("user_id", user.id);
      return new Response(JSON.stringify({ error: "Failed to create investment. Balance has been restored." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Log transaction
    await adminClient.from("transactions").insert({
      user_id: user.id,
      type: "investment",
      amount: amount,
      method: "wallet",
      status: "completed",
      currency: "USD",
      admin_notes: `Investment in ${planName} plan`,
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Investment successful! Your plan has been activated.",
      investment_id: investment.id,
      new_balance: newBalance,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
