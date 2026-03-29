import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, DollarSign, Link2, Gift, Trophy, TrendingUp, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LEVEL_CONFIG = [
  { level: 1, pct: 10, color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Level 1 (Direct)" },
  { level: 2, pct: 5, color: "text-blue-400", bg: "bg-blue-400/10", label: "Level 2" },
  { level: 3, pct: 2, color: "text-purple-400", bg: "bg-purple-400/10", label: "Level 3" },
];

const DashboardReferrals = () => {
  const { user } = useAuth();
  const { format } = useCurrency();
  const queryClient = useQueryClient();

  // Real-time updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("referrals-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "referrals", filter: `referrer_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["referrals", user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const { data: referralCode, isLoading: codeLoading, isError: codeError } = useQuery({
    queryKey: ["referral_code", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data?.code ?? null;
    },
    enabled: !!user,
    retry: 2,
  });

  const { data: referrals } = useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  // Leaderboard - top referrers (all users, aggregated)
  const { data: leaderboard } = useQuery({
    queryKey: ["referral_leaderboard"],
    queryFn: async () => {
      const { data } = await supabase
        .from("referrals")
        .select("referrer_id, bonus_amount")
        .eq("status", "completed");

      if (!data || data.length === 0) return [];

      const map = new Map<string, { count: number; total: number }>();
      data.forEach((r) => {
        const existing = map.get(r.referrer_id) || { count: 0, total: 0 };
        map.set(r.referrer_id, { count: existing.count + 1, total: existing.total + Number(r.bonus_amount) });
      });

      const sorted = [...map.entries()]
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 10);

      // Fetch profile names
      const ids = sorted.map(([id]) => id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", ids);

      const nameMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) ?? []);

      return sorted.map(([id, stats], i) => ({
        rank: i + 1,
        name: nameMap.get(id) || "Anonymous",
        referrals: stats.count,
        earned: stats.total,
        isMe: id === user?.id,
      }));
    },
    enabled: !!user,
  });

  const totalReferrals = referrals?.length ?? 0;
  const earningsByLevel = LEVEL_CONFIG.map((lc) => {
    const levelRefs = referrals?.filter((r) => (r as any).level === lc.level) ?? [];
    return {
      ...lc,
      count: levelRefs.length,
      earned: levelRefs.reduce((s, r) => s + Number(r.bonus_amount), 0),
    };
  });
  const totalEarned = earningsByLevel.reduce((s, l) => s + l.earned, 0);
  const referralLink = referralCode ? `${window.location.origin}/register?ref=${referralCode}` : "";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  // Recent activity (completed referrals with bonus > 0)
  const recentActivity = (referrals ?? [])
    .filter((r) => r.status === "completed" && Number(r.bonus_amount) > 0)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Multi-Level Referral Program</h1>
        <p className="text-muted-foreground text-sm">Earn up to 3 levels deep — 10%, 5%, and 2% commissions</p>
      </div>

      {/* Level breakdown cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {earningsByLevel.map((lv) => (
          <Card key={lv.level} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-10 w-10 rounded-lg ${lv.bg} flex items-center justify-center`}>
                  <span className={`text-lg font-bold ${lv.color}`}>{lv.pct}%</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{lv.label}</p>
                  <p className="text-lg font-display font-bold text-foreground">{lv.count} referrals</p>
                </div>
              </div>
              <p className={`text-sm font-medium ${lv.color}`}>{format(lv.earned)} earned</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
              <p className="text-xl font-display font-bold text-foreground">{totalReferrals}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Earned</p>
              <p className="text-xl font-display font-bold text-success">{format(totalEarned)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Referrals</p>
              <p className="text-xl font-display font-bold text-foreground">
                {referrals?.filter((r) => r.status === "completed").length ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code & Link */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Your Referral Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode ? (
            <>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Your Referral Code</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-lg font-mono font-bold text-primary bg-primary/10 p-3 rounded-lg border border-primary/20 text-center tracking-widest">
                    {referralCode}
                  </code>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralCode, "Referral code")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Your Referral Link</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-foreground bg-muted p-3 rounded-lg border border-border break-all">
                    {referralLink}
                  </code>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink, "Referral link")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-foreground">How it works:</p>
                <p className="text-xs text-muted-foreground">• Level 1 — You earn <span className="text-yellow-400 font-medium">10%</span> from your direct referrals' deposits</p>
                <p className="text-xs text-muted-foreground">• Level 2 — You earn <span className="text-blue-400 font-medium">5%</span> from your referrals' referrals</p>
                <p className="text-xs text-muted-foreground">• Level 3 — You earn <span className="text-purple-400 font-medium">2%</span> from the third level down</p>
              </div>
            </>
          ) : codeLoading ? (
            <div className="flex items-center gap-2 py-4">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading your referral code...</p>
            </div>
          ) : codeError ? (
            <p className="text-sm text-destructive">Unable to load referral code. Please refresh.</p>
          ) : (
            <p className="text-sm text-muted-foreground">No referral code found. Please contact support.</p>
          )}
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Referral Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No referral earnings yet. Share your code to start earning!
            </p>
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {recentActivity.map((ref, i) => {
                  const levelConf = LEVEL_CONFIG.find((l) => l.level === ((ref as any).level || 1)) ?? LEVEL_CONFIG[0];
                  return (
                    <motion.div
                      key={ref.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full ${levelConf.bg} flex items-center justify-center`}>
                          <ArrowRight className={`h-4 w-4 ${levelConf.color}`} />
                        </div>
                        <div>
                          <p className="text-sm text-foreground">
                            You earned <span className="font-medium text-success">{format(Number(ref.bonus_amount))}</span> from a referral
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {levelConf.label} • {new Date(ref.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className={`${levelConf.bg} ${levelConf.color} border-0`}>
                        L{(ref as any).level || 1}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Top Referrers Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(leaderboard ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No leaderboard data yet. Be the first to earn!
            </p>
          ) : (
            <div className="space-y-2">
              {(leaderboard ?? []).map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    entry.isMe ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      entry.rank === 1 ? "bg-yellow-400/20 text-yellow-400" :
                      entry.rank === 2 ? "bg-gray-300/20 text-gray-300" :
                      entry.rank === 3 ? "bg-amber-600/20 text-amber-600" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {entry.rank}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {entry.name} {entry.isMe && <span className="text-xs text-primary">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{entry.referrals} referrals</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-success">{format(entry.earned)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Referral History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {(referrals ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No referrals yet. Share your code to start earning!
            </p>
          ) : (
            <div className="space-y-2">
              {(referrals ?? []).map((ref) => {
                const levelConf = LEVEL_CONFIG.find((l) => l.level === ((ref as any).level || 1)) ?? LEVEL_CONFIG[0];
                return (
                  <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div>
                      <p className="text-sm text-foreground">
                        {levelConf.label} Referral
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <Badge variant={ref.status === "completed" ? "default" : "secondary"}>
                        {ref.status}
                      </Badge>
                      {Number(ref.bonus_amount) > 0 && (
                        <span className="text-sm font-medium text-success">+{format(Number(ref.bonus_amount))}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardReferrals;
