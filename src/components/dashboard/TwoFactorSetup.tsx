import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const TwoFactorSetup = () => {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (!error && data) {
      const verified = data.totp.filter((f) => f.status === "verified");
      setIsEnrolled(verified.length > 0);
      if (verified.length > 0) {
        setFactorId(verified[0].id);
      }
    }
    setLoading(false);
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator App",
    });
    setEnrolling(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setShowEnrollDialog(true);
    }
  };

  const handleVerifyEnrollment = async () => {
    if (verifyCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    setVerifying(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setVerifying(false);
      toast.error(challengeError.message);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: verifyCode,
    });
    setVerifying(false);
    if (verifyError) {
      toast.error("Invalid code. Please try again.");
      return;
    }
    toast.success("Two-factor authentication enabled successfully!");
    setShowEnrollDialog(false);
    setVerifyCode("");
    setIsEnrolled(true);
  };

  const handleDisable = async () => {
    if (disableCode.length !== 6) {
      toast.error("Please enter a 6-digit code to confirm");
      return;
    }
    setDisabling(true);
    // Verify current code before unenrolling
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setDisabling(false);
      toast.error(challengeError.message);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: disableCode,
    });
    if (verifyError) {
      setDisabling(false);
      toast.error("Invalid code. Cannot disable 2FA.");
      return;
    }
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setDisabling(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Two-factor authentication disabled.");
    setShowDisableDialog(false);
    setDisableCode("");
    setIsEnrolled(false);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground">Two-Factor Authentication</p>
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEnrolled ? (
            <ShieldCheck className="h-5 w-5 text-success" />
          ) : (
            <Shield className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm text-foreground">Two-Factor Authentication (2FA)</p>
            <p className="text-xs text-muted-foreground">
              {isEnrolled
                ? "Your account is protected with an authenticator app"
                : "Add an extra layer of security to your account"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${isEnrolled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
            {isEnrolled ? "Enabled" : "Disabled"}
          </Badge>
          {isEnrolled ? (
            <Button variant="outline" size="sm" onClick={() => setShowDisableDialog(true)}>
              <ShieldOff className="h-3.5 w-3.5 mr-1" /> Disable
            </Button>
          ) : (
            <Button size="sm" className="bg-gradient-brand text-primary-foreground font-semibold" onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Shield className="h-3.5 w-3.5 mr-1" />}
              Enable
            </Button>
          )}
        </div>
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Set Up Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center bg-white rounded-lg p-4">
              {qrCode && <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Can't scan? Enter this key manually:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono break-all">{secret}</code>
                <Button variant="outline" size="sm" onClick={copySecret}>
                  {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-foreground font-medium">Verification Code</label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-lg tracking-widest font-mono"
              />
              <p className="text-xs text-muted-foreground">Enter the 6-digit code from your authenticator app</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>Cancel</Button>
            <Button
              className="bg-gradient-brand text-primary-foreground font-semibold"
              onClick={handleVerifyEnrollment}
              disabled={verifying || verifyCode.length !== 6}
            >
              {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-destructive" /> Disable 2FA
            </DialogTitle>
            <DialogDescription>
              Enter a code from your authenticator app to confirm disabling two-factor authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-lg tracking-widest font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={disabling || disableCode.length !== 6}
            >
              {disabling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TwoFactorSetup;