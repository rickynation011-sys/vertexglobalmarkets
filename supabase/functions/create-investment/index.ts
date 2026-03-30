import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Default plans (fallback if not in platform_settings)
const DEFAULT_PLANS: Record<string, { min: number; max: number; duration: number; annualRate: number }> = {
  "Starter Plan": { min: 200, max: 50000, duration: 30, annualRate: 1.5 },
  "Growth Plan": { min: 500, max: 100000, duration: 60, annualRate: 2 },
  "Advanced Plan": { min: 1000, max: 200000, duration: 90, annualRate: 2.5 },
  "Real Estate Income": { min: 2500, max: 150000, duration: 90, annualRate: 8 },
  "VIP Elite": { min: 25000, max: 1000000, duration: 30, annualRate: 12.5 },
  // Legacy names for backward compatibility
  "Conservative Growth": { min: 500, max: 50000, duration: 30, annualRate: 5 },
  "Balanced Portfolio": { min: 2000, max: 100000, duration: 30, annualRate: 7.5 },
  "Aggressive Alpha": { min: 5000, max: 200000, duration: 30, annualRate: 10 },
  "Forex Specialist": { min: 1000, max: 75000, duration: 30, annualRate: 6.5 },
  "Crypto Momentum": { min: 1500, max: 100000, duration: 30, annualRate: 9.5 },
};

// Duration-based rates for category investments from DashboardOverview
const DURATION_RATES: Record<string, { durationDays: number; annualRate: number }> = {
  "1 Hour": { durationDays: 1, annualRate: 0.5 },
  "24 Hours": { durationDays: 1, annualRate: 2.5 },
  "3 Days": { durationDays: 3, annualRate: 5 },
  "7 Days": { durationDays: 7, annualRate: 10 },
  "30 Days": { durationDays: 30, annualRate: 25 },
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

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const planName = typeof body.plan_name === "string" ? body.plan_name.trim() : "";
    const amount = typeof body.amount === "number" ? body.amount : NaN;

    if (!planName) {
      return new Response(JSON.stringify({ error: "Plan name is required." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid investment amount." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Try to find plan config: 1) DB platform_settings, 2) Default plans, 3) Category-based duration match
    let planConfig: { min: number; max: number; duration: number; annualRate: number } | null = null;

    // 1. Check platform_settings for admin-managed plans
    const { data: dbPlans } = await adminClient.from("platform_settings").select("*").like("key", "investment_plan_%");
    if (dbPlans && dbPlans.length > 0) {
      for (const dp of dbPlans) {
        const v = dp.value as any;
        if (v.name === planName) {
          planConfig = { min: v.min, max: v.max, duration: v.duration, annualRate: v.annualRate };
          break;
        }
      }
    }

    // 2. Check default plans
    if (!planConfig && DEFAULT_PLANS[planName]) {
      planConfig = DEFAULT_PLANS[planName];
    }

    // 3. Check for category-based plan names like "Cryptocurrency (7 Days)"
    if (!planConfig) {
      const durationMatch = planName.match(/\((.+)\)$/);
      if (durationMatch) {
        const durLabel = durationMatch[1];
        const durConfig = DURATION_RATES[durLabel];
        if (durConfig) {
          planConfig = {
            min: 10,
            max: 1000000,
            duration: durConfig.durationDays,
            annualRate: durConfig.annualRate,
          };
        }
      }
    }

    if (!planConfig) {
      return new Response(JSON.stringify({ error: "Invalid investment plan." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (amount < planConfig.min) {
      return new Response(JSON.stringify({ error: `Minimum investment for this plan is $${planConfig.min.toLocaleString()}.` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (amount > planConfig.max) {
      return new Response(JSON.stringify({ error: `Maximum investment for this plan is $${planConfig.max.toLocaleString()}.` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
    endsAt.setDate(endsAt.getDate() + planConfig.duration);

    const { data: investment, error: investError } = await adminClient
      .from("investments")
      .insert({
        user_id: user.id,
        plan_name: planName,
        amount: amount,
        current_value: amount,
        return_pct: 0,
        daily_rate: planConfig.annualRate,
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

    // Log transaction (investment debit)
    await adminClient.from("transactions").insert({
      user_id: user.id,
      type: "investment",
      amount: amount,
      method: "wallet",
      status: "completed",
      currency: "USD",
      admin_notes: `Investment in ${planName} plan`,
    });

    // Send investment confirmation email
    const { data: prof } = await adminClient.from("profiles").select("email, full_name").eq("user_id", user.id).single();
    if (prof?.email) {
      await adminClient.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'investment-confirmation',
          recipientEmail: prof.email,
          idempotencyKey: `investment-${investment.id}`,
          templateData: { name: prof.full_name || undefined, planName, amount: amount.toLocaleString() },
        },
      });
    }

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
