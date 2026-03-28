import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory cache (per cold start)
let cachedRates: Record<string, number> | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const base = url.searchParams.get("base") || "USD";

    // Return cached if fresh
    if (cachedRates && Date.now() - cacheTime < CACHE_TTL && base === "USD") {
      return new Response(JSON.stringify({ base: "USD", rates: cachedRates }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use free API (no key required)
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${base}`;
    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      throw new Error(`Exchange rate API returned ${resp.status}`);
    }
    const data = await resp.json();

    if (base === "USD") {
      cachedRates = data.rates;
      cacheTime = Date.now();
    }

    return new Response(JSON.stringify({ base: data.base, rates: data.rates }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
