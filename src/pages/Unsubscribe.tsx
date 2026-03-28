import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, MailX } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "already" | "invalid" | "success" | "error">("loading");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: SUPABASE_KEY },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid === true) setStatus("valid");
        else if (data.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleUnsubscribe = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setStatus(data.success ? "success" : data.reason === "already_unsubscribed" ? "already" : "error");
    } catch {
      setStatus("error");
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardContent className="p-8 text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Verifying...</p>
            </>
          )}
          {status === "valid" && (
            <>
              <MailX className="h-10 w-10 text-warning mx-auto" />
              <p className="text-foreground font-medium text-lg">Unsubscribe from emails?</p>
              <p className="text-sm text-muted-foreground">
                You will no longer receive app notification emails from Vertex Global Markets.
              </p>
              <Button onClick={handleUnsubscribe} disabled={processing} className="w-full bg-destructive text-destructive-foreground">
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm Unsubscribe
              </Button>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-10 w-10 text-success mx-auto" />
              <p className="text-foreground font-medium text-lg">Unsubscribed</p>
              <p className="text-sm text-muted-foreground">You have been successfully unsubscribed.</p>
            </>
          )}
          {status === "already" && (
            <>
              <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-foreground font-medium">Already unsubscribed</p>
              <p className="text-sm text-muted-foreground">This email address was already unsubscribed.</p>
            </>
          )}
          {status === "invalid" && (
            <>
              <XCircle className="h-10 w-10 text-destructive mx-auto" />
              <p className="text-foreground font-medium">Invalid link</p>
              <p className="text-sm text-muted-foreground">This unsubscribe link is invalid or has expired.</p>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-10 w-10 text-destructive mx-auto" />
              <p className="text-foreground font-medium">Something went wrong</p>
              <p className="text-sm text-muted-foreground">Please try again or contact support.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
