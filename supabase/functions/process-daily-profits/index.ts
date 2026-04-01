import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Manual-only daily profit processor.
 * Triggered exclusively by admin clicking "Process Daily Profit".
 * No cron, no time restrictions. Each click = one profit cycle.
 * Tracks last_profit_processed_date to prevent same-day duplicates.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const trigger = req.headers.get("x-trigger") || "admin-manual";

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const toNumber = (value: unknown) => {
      const parsed = Number(value ?? 0);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const nowUtc = new Date();
    const processedAt = nowUtc.toISOString();
    const todayStr = nowUtc.toISOString().slice(0, 10); // YYYY-MM-DD

    // Get all users with active investments
    const { data: activeUsers, error: usersErr } = await supabase
      .from("investments")
      .select("user_id")
      .eq("status", "active")
      .gt("daily_rate", 0);

    if (usersErr) throw usersErr;
    if (!activeUsers || activeUsers.length === 0) {
      await supabase.from("profit_processing_logs").insert({
        processed_count: 0, total_profit: 0, status: "success",
        triggered_by: trigger,
      });
      return new Response(JSON.stringify({ message: "No active investments found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const uniqueUserIds = [...new Set(activeUsers.map((u: any) => u.user_id))];

    // Fetch profiles
    const { data: profiles, error: profErr } = await supabase
      .from("profiles")
      .select("user_id, email, full_name, wallet_balance, timezone, last_profit_processed_date")
      .in("user_id", uniqueUserIds);

    if (profErr) throw profErr;

    const profileMap = new Map<string, any>();
    for (const p of profiles ?? []) {
      profileMap.set(p.user_id, p);
    }

    // Filter: skip users already processed today
    const eligibleUserIds = uniqueUserIds.filter(userId => {
      const profile = profileMap.get(userId);
      if (!profile) return false;
      return profile.last_profit_processed_date !== todayStr;
    });

    if (eligibleUserIds.length === 0) {
      await supabase.from("profit_processing_logs").insert({
        processed_count: 0, total_profit: 0, status: "success",
        triggered_by: trigger,
      });
      return new Response(JSON.stringify({
        message: "All users have already been processed today. Profits can only be distributed once per day.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch active investments for eligible users
    const { data: investments, error: invErr } = await supabase
      .from("investments")
      .select("id, user_id, amount, current_value, daily_rate, ends_at, plan_name")
      .eq("status", "active")
      .gt("daily_rate", 0)
      .in("user_id", eligibleUserIds);

    if (invErr) throw invErr;

    let processed = 0;
    let totalProfit = 0;
    const processedUserIds = new Set<string>();

    for (const inv of (investments ?? []).sort((a, b) => {
      if (a.user_id === b.user_id) return a.id.localeCompare(b.id);
      return a.user_id.localeCompare(b.user_id);
    })) {
      const amount = toNumber(inv.amount);
      const currentValue = toNumber(inv.current_value);
      const dailyRate = toNumber(inv.daily_rate);

      // Handle expired investments
      if (new Date(inv.ends_at) < nowUtc) {
        await supabase.from("investments").update({ status: "completed" }).eq("id", inv.id);

        const profile = profileMap.get(inv.user_id);
        // Return full value: initial capital + accumulated profit
        const profit = Math.max(0, currentValue - amount);
        const finalValue = amount + profit;
        if (profile && finalValue > 0) {
          const newBal = Math.max(0, toNumber(profile.wallet_balance) + finalValue);
          await supabase.from("profiles").update({ wallet_balance: newBal }).eq("user_id", inv.user_id);
          profile.wallet_balance = newBal;

          await supabase.from("transactions").insert({
            user_id: inv.user_id,
            type: "deposit",
            amount: finalValue,
            method: "investment_return",
            status: "completed",
            currency: "USD",
            admin_notes: `Matured ${inv.plan_name}: capital $${amount.toFixed(2)} + profit $${profit.toFixed(2)}`,
          });
        }

        if (profile?.email) {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "investment-matured",
              recipientEmail: profile.email,
              idempotencyKey: `investment-matured-${inv.id}`,
              templateData: {
                name: profile.full_name || undefined,
                planName: inv.plan_name,
                amount: amount.toLocaleString(),
                profit: profit.toFixed(2),
                totalValue: finalValue.toLocaleString(),
              },
            },
          });
        }
        processedUserIds.add(inv.user_id);
        continue;
      }

      // Calculate daily profit: daily_rate is stored as daily percentage (e.g. 2 = 2%)
      const dailyProfit = amount * (dailyRate / 100);
      if (dailyProfit <= 0) continue;

      const newValue = currentValue + dailyProfit;
      const returnPct = amount > 0 ? ((newValue - amount) / amount) * 100 : 0;

      // Update investment value
      await supabase.from("investments").update({
        current_value: newValue,
        return_pct: returnPct,
      }).eq("id", inv.id);

      // Credit profit to wallet balance
      const profile = profileMap.get(inv.user_id);
      if (profile) {
        const currentBalance = Math.max(0, toNumber(profile.wallet_balance) + dailyProfit);
        await supabase.from("profiles").update({
          wallet_balance: currentBalance,
        }).eq("user_id", inv.user_id);
        profile.wallet_balance = currentBalance;
      }

      // Log profit for P&L tracking
      await supabase.from("profit_logs").insert({
        user_id: inv.user_id,
        investment_id: inv.id,
        amount: dailyProfit,
        created_at: processedAt,
      });

      totalProfit += dailyProfit;
      processed++;
      processedUserIds.add(inv.user_id);
    }

    // Mark all processed users to prevent duplicate processing today
    for (const userId of processedUserIds) {
      await supabase.from("profiles").update({
        last_profit_processed_date: todayStr,
      }).eq("user_id", userId);
    }

    // Log the processing run
    await supabase.from("profit_processing_logs").insert({
      processed_count: processed,
      total_profit: totalProfit,
      status: "success",
      triggered_by: trigger,
    });

    return new Response(JSON.stringify({
      message: `Processed ${processed} investments for ${processedUserIds.size} users`,
      totalProfit,
      usersProcessed: processedUserIds.size,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      await supabase.from("profit_processing_logs").insert({
        processed_count: 0, total_profit: 0, status: "error",
        error_message: error.message, triggered_by: trigger,
      });
    } catch (_) { /* ignore logging errors */ }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
