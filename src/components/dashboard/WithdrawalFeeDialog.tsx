import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface WithdrawalFeeDialogProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
  userName: string;
  totalProfit: number;
  processingFee: number;
}

const fmt = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const WithdrawalFeeDialog = ({ open, onClose, onProceed, userName, totalProfit, processingFee }: WithdrawalFeeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-display">Withdrawal Processing Notice</DialogTitle>
          <DialogDescription className="sr-only">Processing fee details for withdrawal</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Dear <span className="font-medium text-foreground">{userName}</span>,
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To proceed with your withdrawal request, a processing fee is required.
          </p>

          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your total profit</span>
              <span className="text-lg font-display font-bold text-foreground">{fmt(totalProfit)}</span>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Processing fee (10%)</span>
              <span className="text-lg font-display font-bold text-primary">{fmt(processingFee)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
            <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              This fee is part of the settlement process and must be completed before your withdrawal can be processed.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 bg-gradient-brand text-primary-foreground font-semibold" onClick={onProceed}>
              Proceed to Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalFeeDialog;
