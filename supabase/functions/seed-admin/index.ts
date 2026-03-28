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
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const adminEmail = "admin@vertexglobalmarkets.com";
    const adminPassword = "Admin@1234";

    // Check if admin user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u: any) => u.email === adminEmail);

    let userId: string;

    if (existing) {
      userId = existing.id;
      // Ensure email is confirmed and password is correct
      await supabase.auth.admin.updateUserById(userId, {
        email_confirm: true,
        password: adminPassword,
        user_metadata: { full_name: "Platform Administrator" },
      });
    } else {
      // Create the admin user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: "Platform Administrator" },
      });

      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Ensure admin role exists
    const { data: roleExists } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleExists) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      if (roleError) throw roleError;
    }

    // Ensure profile exists
    const { data: profileExists } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profileExists) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          email: adminEmail,
          full_name: "Platform Administrator",
          status: "active",
        });
      if (profileError) throw profileError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Admin account ready", userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
