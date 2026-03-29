import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface DepositMethod {
  id: string;
  currency: string;
  network: string | null;
  wallet_address: string;
  label: string | null;
}

const fmt = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

const DashboardFeePayment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: profitLogs } = useQuery({
    queryKey: ["total_profit", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profit_logs")
        .select("amount")
        .eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: depositMethods } = useQuery({
    queryKey: ["deposit_methods"],
    queryFn: async () => {
      const { data } = await supabase.from("deposit_methods").select("*").eq("is_active", true);
      return (data as DepositMethod[]) ?? [];
    },
    enabled: !!user,
  });

  const { data: existingPayments } = useQuery({
    queryKey: ["fee_payments", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("fee_payments")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const totalProfit = (profitLogs ?? []).reduce((s, l) => s + Number(l.amount), 0);
  const processingFee = totalProfit * 0.10;
  const selectedMethod = (depositMethods ?? []).find((m) => m.id === selectedMethodId);

  const hasPendingOrApproved = (existingPayments ?? []).some(
    (p: any) => p.status === "pending" || p.status === "approved"
  );

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMethod) throw new Error("Select a payment method");
      if (!proofFile) throw new Error("Upload proof of payment");

      setUploading(true);

      // Upload proof
      const fileExt = proofFile.name.split(".").pop();
      const filePath = `${user!.id}/fee-proofs/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("ticket-attachments")
        .upload(filePath, proofFile);
      if (uploadError) throw uploadError;

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("ticket-attachments")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year
      if (signedUrlError) throw signedUrlError;

      const methodLabel = `${selectedMethod.currency}${selectedMethod.network ? ` (${selectedMethod.network})` : ""}`;

      const feePaymentId = crypto.randomUUID();
      const { error } = await supabase.from("fee_payments").insert({
        id: feePaymentId,
        user_id: user!.id,
        total_profit: totalProfit,
        processing_fee: processingFee,
        payment_method: methodLabel,
        proof_url: signedUrlData.signedUrl,
        status: "pending",
      });
      if (error) throw error;

      // Send admin notification emails
      const userEmail = profile?.email ?? user!.email ?? "";
      const userName = profile?.full_name ?? "Unknown User";
      const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      if (adminRoles?.length) {
        const { data: adminProfiles } = await supabase.from("profiles").select("email").in("user_id", adminRoles.map(r => r.user_id));
        for (const admin of adminProfiles ?? []) {
          if (admin.email) {
            supabase.functions.invoke("send-transactional-email", {
              body: {
                templateName: "admin-new-fee-payment",
                recipientEmail: admin.email,
                idempotencyKey: `admin-fee-payment-${feePaymentId}-${admin.email}`,
                templateData: {
                  userName,
                  userEmail,
                  totalProfit: totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2 }),
                  processingFee: processingFee.toLocaleString("en-US", { minimumFractionDigits: 2 }),
                  paymentMethod: methodLabel,
                  submittedAt: new Date().toISOString(),
                },
              },
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee_payments", user?.id] });
      toast.success(`Payment of ${fmt(processingFee)} submitted successfully. Awaiting verification.`);
      setSelectedMethodId("");
      setProofFile(null);
      setUploading(false);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setUploading(false);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Withdrawal Processing Fee</h1>
        <p className="text-muted-foreground text-sm">Complete the processing fee to proceed with your withdrawal</p>
      </div>

      {/* Summary */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Holder</p>
              <p className="font-display font-bold text-foreground">{profile?.full_name ?? "User"}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Profit</span>
              <span className="text-xl font-display font-bold text-foreground">{fmt(totalProfit)}</span>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Processing Fee (10%)</span>
              <span className="text-xl font-display font-bold text-primary">{fmt(processingFee)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment form */}
      {!hasPendingOrApproved && totalProfit > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Make Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Payment Method</label>
              <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select crypto" /></SelectTrigger>
                <SelectContent>
                  {(depositMethods ?? []).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.currency}{m.network ? ` (${m.network})` : ""}{m.label ? ` — ${m.label}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMethod && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Send exactly <span className="font-bold text-foreground">{fmt(processingFee)}</span> in {selectedMethod.currency} to:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-foreground bg-background p-2 rounded border border-border break-all">
                    {selectedMethod.wallet_address}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMethod.wallet_address);
                      toast.success("Address copied!");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {selectedMethod.network && (
                  <p className="text-[10px] text-warning">⚠️ Use the {selectedMethod.network} network</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Upload Proof (TX hash screenshot or receipt)</label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                  className="text-xs"
                />
                {proofFile && (
                  <div className="flex items-center gap-1 text-success">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Ready</span>
                  </div>
                )}
              </div>
            </div>

            <ol className="text-xs text-muted-foreground space-y-1 pl-4 list-decimal">
              <li>Copy the wallet address above</li>
              <li>Send exact fee amount: <span className="font-bold text-foreground">{fmt(processingFee)}</span></li>
              <li>Upload proof (TX hash or screenshot)</li>
              <li>Click Submit</li>
            </ol>

            <Button
              className="w-full bg-gradient-brand text-primary-foreground font-semibold"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || !selectedMethodId || !proofFile}
            >
              {submitMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" /> Submit Payment Proof</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {totalProfit <= 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No profits recorded yet. Processing fee is calculated on your total profit.</p>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {(existingPayments ?? []).length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {(existingPayments ?? []).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.payment_method}</p>
                    <p className="text-xs text-muted-foreground">
                      Profit: {fmt(Number(p.total_profit))} · Fee: {fmt(Number(p.processing_fee))}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p>
                  </div>
                  <Badge className={`text-xs ${statusColors[p.status] ?? ""}`}>{p.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardFeePayment;
