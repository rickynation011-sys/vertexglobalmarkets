import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Timezone-aware daily profit processor.
 * Runs every 10 minutes via cron. For each user with active investments,
 * checks if it's currently 1:00 AM in their local timezone and processes
 * profits only once per calendar day (tracked via last_profit_processed_date).
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const nowUtc = new Date();
    const trigger = req.headers.get("x-trigger") || "cron";
    const isManual = trigger === "admin-manual";

    // Get distinct user_ids with active investments, joined with their timezone & last processed date
    const { data: activeUsers, error: usersErr } = await supabase
      .from("investments")
      .select("user_id")
      .eq("status", "active")
      .gt("daily_rate", 0);

    if (usersErr) throw usersErr;
    if (!activeUsers || activeUsers.length === 0) {
      await supabase.from("profit_processing_logs").insert({
        processed_count: 0, total_profit: 0, status: "success",
        triggered_by: req.headers.get("x-trigger") || "cron",
      });
      return new Response(JSON.stringify({ message: "No active investments" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduplicate user_ids
    const uniqueUserIds = [...new Set(activeUsers.map((u: any) => u.user_id))];

    // Fetch profiles for these users (timezone + last_profit_processed_date)
    const { data: profiles, error: profErr } = await supabase
      .from("profiles")
      .select("user_id, email, full_name, wallet_balance, timezone, last_profit_processed_date")
      .in("user_id", uniqueUserIds);

    if (profErr) throw profErr;

    const profileMap = new Map<string, any>();
    for (const p of profiles ?? []) {
      profileMap.set(p.user_id, p);
    }

    // Determine which users are eligible (it's 1:00 AM in their timezone, not yet processed today)
    const eligibleUserIds: string[] = [];

    for (const userId of uniqueUserIds) {
      const profile = profileMap.get(userId);
      if (!profile) continue;

      const tz = profile.timezone || "UTC";
      let localHour: number;
      let localDateStr: string;

      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          hour: "numeric",
          hour12: false,
        });
        localHour = parseInt(formatter.format(nowUtc), 10);

        const dateFormatter = new Intl.DateTimeFormat("en-CA", {
          timeZone: tz,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        localDateStr = dateFormatter.format(nowUtc); // YYYY-MM-DD
      } catch {
        // Invalid timezone, fall back to UTC
        localHour = nowUtc.getUTCHours();
        localDateStr = nowUtc.toISOString().slice(0, 10);
      }

      // Check: is it the 1 AM hour? (covers 1:00-1:09 since cron runs every 10 min)
      if (localHour !== 1) continue;

      // Check: not already processed today
      if (profile.last_profit_processed_date === localDateStr) continue;

      eligibleUserIds.push(userId);
    }

    if (eligibleUserIds.length === 0) {
      await supabase.from("profit_processing_logs").insert({
        processed_count: 0, total_profit: 0, status: "success",
        triggered_by: req.headers.get("x-trigger") || "cron",
      });
      return new Response(JSON.stringify({ message: "No users eligible at this time" }), {
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

    for (const inv of investments ?? []) {
      // Check if investment has expired
      if (new Date(inv.ends_at) < nowUtc) {
        await supabase.from("investments").update({ status: "completed" }).eq("id", inv.id);

        // Credit initial capital back to wallet balance on maturity
        const profile = profileMap.get(inv.user_id);
        const capitalReturn = Number(inv.amount);
        if (profile && capitalReturn > 0) {
          const newBal = Number(profile.wallet_balance) + capitalReturn;
          await supabase.from("profiles").update({ wallet_balance: newBal }).eq("user_id", inv.user_id);
          profile.wallet_balance = newBal;

          // Log the capital return as a transaction
          await supabase.from("transactions").insert({
            user_id: inv.user_id,
            type: "deposit",
            amount: capitalReturn,
            method: "investment_return",
            status: "completed",
            currency: "USD",
            admin_notes: `Capital returned from matured ${inv.plan_name} plan`,
          });
        }

        if (profile?.email) {
          const profit = (Number(inv.current_value) - Number(inv.amount)).toFixed(2);
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "investment-matured",
              recipientEmail: profile.email,
              idempotencyKey: `investment-matured-${inv.id}`,
              templateData: {
                name: profile.full_name || undefined,
                planName: inv.plan_name,
                amount: Number(inv.amount).toLocaleString(),
                profit,
                totalValue: Number(inv.current_value).toLocaleString(),
              },
            },
          });
        }
        processedUserIds.add(inv.user_id);
        continue;
      }

      // Calculate daily profit
      const dailyProfit = Number(inv.amount) * (Number(inv.daily_rate) / 365);
      if (dailyProfit <= 0) continue;

      const newValue = Number(inv.current_value) + dailyProfit;
      const returnPct = ((newValue - Number(inv.amount)) / Number(inv.amount)) * 100;

      await supabase.from("investments").update({
        current_value: newValue,
        return_pct: returnPct,
      }).eq("id", inv.id);

      // Update wallet balance
      const profile = profileMap.get(inv.user_id);
      if (profile) {
        const currentBalance = Number(profile.wallet_balance) + dailyProfit;
        await supabase.from("profiles").update({
          wallet_balance: currentBalance,
        }).eq("user_id", inv.user_id);
        // Update local cache so subsequent investments for same user use correct balance
        profile.wallet_balance = currentBalance;
      }

      await supabase.from("profit_logs").insert({
        user_id: inv.user_id,
        investment_id: inv.id,
        amount: dailyProfit,
      });

      totalProfit += dailyProfit;
      processed++;
      processedUserIds.add(inv.user_id);
    }

    // Mark all processed users with today's date to prevent duplicate processing
    for (const userId of processedUserIds) {
      const profile = profileMap.get(userId);
      const tz = profile?.timezone || "UTC";
      let localDateStr: string;
      try {
        const dateFormatter = new Intl.DateTimeFormat("en-CA", {
          timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
        });
        localDateStr = dateFormatter.format(nowUtc);
      } catch {
        localDateStr = nowUtc.toISOString().slice(0, 10);
      }
      await supabase.from("profiles").update({
        last_profit_processed_date: localDateStr,
      }).eq("user_id", userId);
    }

    await supabase.from("profit_processing_logs").insert({
      processed_count: processed,
      total_profit: totalProfit,
      status: "success",
      triggered_by: req.headers.get("x-trigger") || "cron",
    });

    return new Response(JSON.stringify({
      message: `Processed ${processed} investments for ${processedUserIds.size} users`,
      totalProfit,
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
        error_message: error.message, triggered_by: "cron",
      });
    } catch (_) { /* ignore logging errors */ }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
