import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileCheck, AlertTriangle, Clock, ShieldCheck, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useRef } from "react";

const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID Card" },
  { value: "drivers_license", label: "Driver's License" },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { label: "Pending Review", variant: "secondary", icon: Clock },
  approved: { label: "Approved", variant: "default", icon: ShieldCheck },
  rejected: { label: "Rejected", variant: "destructive", icon: AlertTriangle },
};

const DashboardKYC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const docInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const [documentType, setDocumentType] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const { data: kyc, isLoading } = useQuery({
    queryKey: ["kyc", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("kyc_verifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const submitKYC = useMutation({
    mutationFn: async () => {
      if (!documentType) throw new Error("Select a document type");
      if (!docFile) throw new Error("Upload your identity document");
      if (!selfieFile) throw new Error("Upload a selfie for verification");

      const userId = user!.id;
      const timestamp = Date.now();

      // Upload document
      const docPath = `${userId}/document-${timestamp}.${docFile.name.split(".").pop()}`;
      const { error: docErr } = await supabase.storage
        .from("kyc-documents")
        .upload(docPath, docFile, { upsert: true });
      if (docErr) throw new Error(`Document upload failed: ${docErr.message}`);

      // Upload selfie
      const selfiePath = `${userId}/selfie-${timestamp}.${selfieFile.name.split(".").pop()}`;
      const { error: selfieErr } = await supabase.storage
        .from("kyc-documents")
        .upload(selfiePath, selfieFile, { upsert: true });
      if (selfieErr) throw new Error(`Selfie upload failed: ${selfieErr.message}`);

      // Insert KYC record
      const { error } = await supabase.from("kyc_verifications").insert({
        user_id: userId,
        document_type: documentType,
        document_url: docPath,
        selfie_url: selfiePath,
        status: "pending",
      });
      if (error) throw error;

      // Notify admin(s) about new KYC submission
      const { data: prof } = await supabase.from("profiles").select("email, full_name").eq("user_id", userId).single();
      const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      if (adminRoles && adminRoles.length > 0) {
        const { data: adminProfiles } = await supabase.from("profiles").select("email").in("user_id", adminRoles.map((r: any) => r.user_id));
        for (const admin of adminProfiles ?? []) {
          if (admin.email) {
            supabase.functions.invoke('send-transactional-email', {
              body: {
                templateName: 'admin-new-kyc',
                recipientEmail: admin.email,
                idempotencyKey: `admin-kyc-${userId}-${Date.now()}-${admin.email}`,
                templateData: {
                  userName: prof?.full_name || 'Unknown',
                  userEmail: prof?.email || '',
                  documentType,
                  submittedAt: new Date().toISOString(),
                },
              },
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["kyc-status", user?.id] });
      toast.success("KYC documents submitted successfully. We'll review them shortly.");
      setDocFile(null);
      setSelfieFile(null);
      setDocumentType("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const status = kyc ? statusConfig[kyc.status] ?? statusConfig.pending : null;
  const canSubmit = !kyc || kyc.status === "rejected";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Identity Verification</h1>
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Identity Verification</h1>
        <p className="text-muted-foreground text-sm">Submit your documents to verify your identity (KYC)</p>
      </div>

      {/* Current Status */}
      {kyc && status && (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${kyc.status === "approved" ? "bg-success/10" : kyc.status === "rejected" ? "bg-destructive/10" : "bg-muted"}`}>
                <status.icon className={`h-6 w-6 ${kyc.status === "approved" ? "text-success" : kyc.status === "rejected" ? "text-destructive" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">Verification Status</h3>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Document type: <span className="text-foreground capitalize">{kyc.document_type.replace("_", " ")}</span>
                  {" · "}Submitted {new Date(kyc.submitted_at).toLocaleDateString()}
                </p>
                {kyc.status === "rejected" && kyc.reviewer_notes && (
                  <p className="text-sm text-destructive mt-2">Reason: {kyc.reviewer_notes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      {canSubmit && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" /> Identity Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Document Type</label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((dt) => (
                      <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Upload Document</label>
                <input
                  ref={docInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="mt-1 w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  {docFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileCheck className="h-8 w-8 text-success" />
                      <span className="text-sm text-foreground font-medium">{docFile.name}</span>
                      <span className="text-xs text-muted-foreground">{(docFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload your document</span>
                      <span className="text-xs text-muted-foreground">JPG, PNG or PDF up to 10MB</span>
                    </div>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" /> Selfie Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Take a clear selfie holding your identity document next to your face. Make sure both your face and document are clearly visible.
              </p>

              <div>
                <input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => selfieInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  {selfieFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileCheck className="h-8 w-8 text-success" />
                      <span className="text-sm text-foreground font-medium">{selfieFile.name}</span>
                      <span className="text-xs text-muted-foreground">{(selfieFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload a selfie</span>
                      <span className="text-xs text-muted-foreground">JPG or PNG up to 10MB</span>
                    </div>
                  )}
                </button>
              </div>

              <Button
                className="w-full"
                onClick={() => submitKYC.mutate()}
                disabled={submitKYC.isPending || !documentType || !docFile || !selfieFile}
              >
                {submitKYC.isPending ? "Submitting…" : "Submit for Verification"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Requirements */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Verification Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Document must be valid and not expired</li>
            <li className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" /> All corners of the document must be visible</li>
            <li className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Selfie must clearly show your face and the document</li>
            <li className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Files must be clear and under 10MB each</li>
            <li className="flex items-start gap-2"><Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Review typically takes 1-3 business days</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardKYC;
