import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all active investments
    const { data: investments, error: fetchErr } = await supabase
      .from("investments")
      .select("id, user_id, amount, current_value, daily_rate, ends_at, plan_name")
      .eq("status", "active")
      .gt("daily_rate", 0);

    if (fetchErr) throw fetchErr;
    if (!investments || investments.length === 0) {
      // Log empty run
      await supabase.from("profit_processing_logs").insert({
        processed_count: 0,
        total_profit: 0,
        status: "success",
        triggered_by: req.headers.get("x-trigger") || "manual",
      });
      return new Response(JSON.stringify({ message: "No active investments to process" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    let totalProfit = 0;

    for (const inv of investments) {
      // Check if investment has expired
      if (new Date(inv.ends_at) < new Date()) {
        await supabase.from("investments").update({ status: "completed" }).eq("id", inv.id);

        // Send investment-matured email
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("email, full_name, wallet_balance")
          .eq("user_id", inv.user_id)
          .single();

        if (userProfile?.email) {
          const profit = (Number(inv.current_value) - Number(inv.amount)).toFixed(2);
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "investment-matured",
              recipientEmail: userProfile.email,
              idempotencyKey: `investment-matured-${inv.id}`,
              templateData: {
                name: userProfile.full_name || undefined,
                planName: inv.plan_name,
                amount: Number(inv.amount).toLocaleString(),
                profit,
                totalValue: Number(inv.current_value).toLocaleString(),
              },
            },
          });
        }
        continue;
      }

      // Calculate daily profit: amount * (annual_rate / 365)
      const dailyProfit = Number(inv.amount) * (Number(inv.daily_rate) / 365);

      if (dailyProfit <= 0) continue;

      // Update investment current_value
      const newValue = Number(inv.current_value) + dailyProfit;
      const returnPct = ((newValue - Number(inv.amount)) / Number(inv.amount)) * 100;

      await supabase.from("investments").update({
        current_value: newValue,
        return_pct: returnPct,
      }).eq("id", inv.id);

      // Add to user wallet_balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("user_id", inv.user_id)
        .single();

      if (profile) {
        await supabase.from("profiles").update({
          wallet_balance: Number(profile.wallet_balance) + dailyProfit,
        }).eq("user_id", inv.user_id);
      }

      // Log the profit
      await supabase.from("profit_logs").insert({
        user_id: inv.user_id,
        investment_id: inv.id,
        amount: dailyProfit,
      });

      totalProfit += dailyProfit;
      processed++;
    }

    // Log the processing run
    await supabase.from("profit_processing_logs").insert({
      processed_count: processed,
      total_profit: totalProfit,
      status: "success",
      triggered_by: req.headers.get("x-trigger") || "manual",
    });

    return new Response(JSON.stringify({ message: `Processed ${processed} investments`, totalProfit }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Try to log the error
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      await supabase.from("profit_processing_logs").insert({
        processed_count: 0,
        total_profit: 0,
        status: "error",
        error_message: error.message,
        triggered_by: "manual",
      });
    } catch (_) { /* ignore logging errors */ }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
