import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const TIME_RANGES = [
  { label: "Last 24h", value: "24h", hours: 24 },
  { label: "Last 7 days", value: "7d", hours: 168 },
  { label: "Last 30 days", value: "30d", hours: 720 },
];

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Sent", value: "sent" },
  { label: "Failed", value: "dlq" },
  { label: "Suppressed", value: "suppressed" },
  { label: "Pending", value: "pending" },
];

const statusBadge = (status: string) => {
  switch (status) {
    case "sent":
      return <Badge className="bg-success/15 text-success border-success/30 text-xs">Sent</Badge>;
    case "dlq":
    case "failed":
      return <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs">Failed</Badge>;
    case "suppressed":
      return <Badge className="bg-warning/15 text-warning border-warning/30 text-xs">Suppressed</Badge>;
    case "pending":
      return <Badge className="bg-muted text-muted-foreground border-border text-xs">Pending</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
};

const PAGE_SIZE = 50;

const AdminEmailDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [page, setPage] = useState(0);

  const startDate = useMemo(() => {
    const range = TIME_RANGES.find((r) => r.value === timeRange);
    return new Date(Date.now() - (range?.hours || 168) * 3600000).toISOString();
  }, [timeRange]);

  // Fetch all logs for the time range (deduplicated server-side isn't possible via SDK, so we deduplicate client-side)
  const { data: rawLogs, isLoading } = useQuery({
    queryKey: ["admin-email-logs", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_send_log")
        .select("*")
        .gte("created_at", startDate)
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data;
    },
  });

  // Deduplicate by message_id (latest status per message_id)
  const deduped = useMemo(() => {
    if (!rawLogs) return [];
    const seen = new Map<string, typeof rawLogs[0]>();
    for (const row of rawLogs) {
      const key = row.message_id || row.id;
      if (!seen.has(key)) seen.set(key, row);
    }
    return Array.from(seen.values());
  }, [rawLogs]);

  // Get distinct template names
  const templateNames = useMemo(() => {
    const names = new Set(deduped.map((r) => r.template_name));
    return Array.from(names).sort();
  }, [deduped]);

  // Apply filters
  const filtered = useMemo(() => {
    return deduped.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (templateFilter !== "all" && r.template_name !== templateFilter) return false;
      return true;
    });
  }, [deduped, statusFilter, templateFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = filtered.length;
    const sent = filtered.filter((r) => r.status === "sent").length;
    const failed = filtered.filter((r) => r.status === "dlq" || r.status === "failed").length;
    const suppressed = filtered.filter((r) => r.status === "suppressed").length;
    const pending = filtered.filter((r) => r.status === "pending").length;
    return { total, sent, failed, suppressed, pending };
  }, [filtered]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Email Dashboard</h1>
        <p className="text-muted-foreground text-sm">Monitor email delivery, failures, and stats</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1.5">
          {TIME_RANGES.map((r) => (
            <Button
              key={r.value}
              size="sm"
              variant={timeRange === r.value ? "default" : "outline"}
              onClick={() => { setTimeRange(r.value); setPage(0); }}
              className={timeRange === r.value ? "bg-primary text-primary-foreground" : ""}
            >
              {r.label}
            </Button>
          ))}
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={templateFilter} onValueChange={(v) => { setTemplateFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            {templateNames.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Mail, color: "text-foreground" },
          { label: "Sent", value: stats.sent, icon: CheckCircle2, color: "text-success" },
          { label: "Failed", value: stats.failed, icon: XCircle, color: "text-destructive" },
          { label: "Suppressed", value: stats.suppressed, icon: AlertTriangle, color: "text-warning" },
          { label: "Pending", value: stats.pending, icon: Loader2, color: "text-muted-foreground" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Log Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !paginated.length ? (
            <p className="text-sm text-muted-foreground text-center py-12">No emails found for this period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Template</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Recipient</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Timestamp</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row) => (
                    <tr key={row.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{row.template_name}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{row.recipient_email}</td>
                      <td className="px-4 py-3">{statusBadge(row.status)}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-destructive text-xs max-w-[250px] truncate">
                        {row.error_message || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages} ({filtered.length} emails)
              </p>
              <div className="flex gap-1.5">
                <Button size="icon" variant="ghost" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEmailDashboard;
