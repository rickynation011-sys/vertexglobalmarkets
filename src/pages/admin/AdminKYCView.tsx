import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle, XCircle, Loader2, Download, ZoomIn, User, FileText, Camera } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

interface KYCData {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string | null;
  selfie_url: string | null;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reviewer_notes: string | null;
}

interface Profile {
  full_name: string | null;
  email: string | null;
  country: string | null;
}

const AdminKYCView = () => {
  const { kycId } = useParams<{ kycId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [kyc, setKyc] = useState<KYCData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!kycId) return;

      const { data: kycData, error } = await supabase
        .from("kyc_verifications")
        .select("*")
        .eq("id", kycId)
        .single();

      if (error || !kycData) {
        setLoading(false);
        return;
      }

      setKyc(kycData);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, country")
        .eq("user_id", kycData.user_id)
        .single();

      setProfile(profileData ?? null);

      // Generate signed URLs for documents
      if (kycData.document_url) {
        const { data: signedDoc } = await supabase.storage
          .from("kyc-documents")
          .createSignedUrl(kycData.document_url, 60 * 60); // 1 hour
        if (signedDoc?.signedUrl) setDocUrl(signedDoc.signedUrl);
      }

      if (kycData.selfie_url) {
        const { data: signedSelfie } = await supabase.storage
          .from("kyc-documents")
          .createSignedUrl(kycData.selfie_url, 60 * 60);
        if (signedSelfie?.signedUrl) setSelfieUrl(signedSelfie.signedUrl);
      }

      setLoading(false);
    };

    fetchData();
  }, [kycId]);

  const handleAction = async (status: "approved" | "rejected") => {
    if (!kyc) return;
    if (status === "rejected" && !reviewNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setActionLoading(true);
    const { error } = await supabase
      .from("kyc_verifications")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id ?? null,
        reviewer_notes: reviewNotes || null,
      })
      .eq("id", kyc.id);

    if (error) {
      toast.error(`Failed to ${status} KYC`);
    } else {
      // Send email notification
      if (profile?.email) {
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: status === "approved" ? "kyc-approved" : "kyc-rejected",
            recipientEmail: profile.email,
            idempotencyKey: `kyc-${status}-${kyc.id}`,
            templateData: {
              name: profile.full_name || undefined,
              reason: reviewNotes || undefined,
            },
          },
        });
      }
      toast.success(`KYC ${status} successfully`);
      setKyc({ ...kyc, status, reviewer_notes: reviewNotes || null, reviewed_at: new Date().toISOString() });
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!kyc) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/admin/kyc")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to KYC List
        </Button>
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center text-muted-foreground">
            KYC submission not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/kyc")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">KYC Document Review</h1>
          <p className="text-muted-foreground text-sm">Review submitted identity documents</p>
        </div>
      </div>

      {/* User Info & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Full Name</span>
              <span className="text-foreground font-medium">{profile?.full_name ?? "Unknown"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground">{profile?.email ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Country</span>
              <span className="text-foreground">{profile?.country ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Document Type</span>
              <span className="text-foreground capitalize">{kyc.document_type.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submitted</span>
              <span className="text-foreground">{new Date(kyc.submitted_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge className={`text-xs ${statusColors[kyc.status]}`}>{kyc.status}</Badge>
            </div>
            {kyc.reviewer_notes && (
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground text-xs">Review Notes</span>
                <p className="text-foreground text-xs mt-1">{kyc.reviewer_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Preview */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Identity Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            {docUrl ? (
              <div className="space-y-3">
                <div
                  className="relative rounded-lg overflow-hidden border border-border cursor-pointer group"
                  onClick={() => setPreviewImage(docUrl)}
                >
                  <img
                    src={docUrl}
                    alt="Identity Document"
                    className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <ZoomIn className="h-8 w-8 text-white" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={docUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" /> Open Full Size
                  </a>
                </Button>
              </div>
            ) : (
              <div className="h-48 rounded-lg bg-muted/50 border border-border flex items-center justify-center text-muted-foreground text-sm">
                No document uploaded
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selfie Preview */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" /> Selfie Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selfieUrl ? (
              <div className="space-y-3">
                <div
                  className="relative rounded-lg overflow-hidden border border-border cursor-pointer group"
                  onClick={() => setPreviewImage(selfieUrl)}
                >
                  <img
                    src={selfieUrl}
                    alt="Selfie"
                    className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <ZoomIn className="h-8 w-8 text-white" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={selfieUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" /> Open Full Size
                  </a>
                </Button>
              </div>
            ) : (
              <div className="h-48 rounded-lg bg-muted/50 border border-border flex items-center justify-center text-muted-foreground text-sm">
                No selfie uploaded
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Panel */}
      {kyc.status === "pending" && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Review Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Reviewer notes (required for rejection)..."
              className="text-sm"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-success text-primary-foreground font-semibold"
                disabled={actionLoading}
                onClick={() => handleAction("approved")}
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button
                className="flex-1"
                variant="destructive"
                disabled={actionLoading}
                onClick={() => handleAction("rejected")}
              >
                <XCircle className="h-4 w-4 mr-2" /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">Document Preview</DialogTitle>
          {previewImage && (
            <img
              src={previewImage}
              alt="Document preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYCView;
