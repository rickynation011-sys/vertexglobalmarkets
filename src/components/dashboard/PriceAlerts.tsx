import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, BellRing, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

type PriceAlert = {
  id: string;
  pair: string;
  targetPrice: number;
  direction: "above" | "below";
  triggered: boolean;
  createdAt: number;
};

interface PriceAlertsProps {
  currentPrices: Record<string, number>;
  pairs: string[];
}

const PriceAlerts = ({ currentPrices, pairs }: PriceAlertsProps) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const stored = localStorage.getItem("price_alerts");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [showDialog, setShowDialog] = useState(false);
  const [newPair, setNewPair] = useState(pairs[0] || "");
  const [newPrice, setNewPrice] = useState("");
  const [newDirection, setNewDirection] = useState<"above" | "below">("above");
  const notifiedRef = useRef<Set<string>>(new Set());

  // Persist
  useEffect(() => {
    localStorage.setItem("price_alerts", JSON.stringify(alerts));
  }, [alerts]);

  // Check alerts
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.triggered || notifiedRef.current.has(alert.id)) return;
      const currentPrice = currentPrices[alert.pair];
      if (!currentPrice) return;

      const triggered =
        (alert.direction === "above" && currentPrice >= alert.targetPrice) ||
        (alert.direction === "below" && currentPrice <= alert.targetPrice);

      if (triggered) {
        notifiedRef.current.add(alert.id);
        setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, triggered: true } : a));
        toast.success(`🔔 Price Alert: ${alert.pair} is now ${alert.direction === "above" ? "above" : "below"} ${alert.targetPrice.toLocaleString()}`, {
          duration: 8000,
        });
      }
    });
  }, [currentPrices, alerts]);

  const addAlert = useCallback(() => {
    const price = parseFloat(newPrice);
    if (!price || price <= 0) { toast.error("Enter a valid price"); return; }
    const alert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      pair: newPair,
      targetPrice: price,
      direction: newDirection,
      triggered: false,
      createdAt: Date.now(),
    };
    setAlerts(prev => [alert, ...prev]);
    setShowDialog(false);
    setNewPrice("");
    toast.success(`Alert set for ${newPair} ${newDirection} ${price.toLocaleString()}`);
  }, [newPair, newPrice, newDirection]);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    notifiedRef.current.delete(id);
  }, []);

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Price Alerts
            </CardTitle>
            <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 gap-1" onClick={() => { setNewPair(pairs[0] || ""); setShowDialog(true); }}>
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {alerts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No alerts set. Add one to get notified when a price target is hit.</p>
          ) : (
            <>
              {activeAlerts.map(alert => {
                const current = currentPrices[alert.pair];
                const distance = current ? ((alert.targetPrice - current) / current * 100).toFixed(2) : null;
                return (
                  <div key={alert.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${alert.direction === "above" ? "bg-success/10" : "bg-destructive/10"}`}>
                        {alert.direction === "above" ? <ArrowUp className="h-3 w-3 text-success" /> : <ArrowDown className="h-3 w-3 text-destructive" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{alert.pair}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {alert.direction === "above" ? "≥" : "≤"} {alert.targetPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                          {distance && <span className="ml-1">({distance}%)</span>}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeAlert(alert.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
              {triggeredAlerts.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] text-muted-foreground mb-1">Triggered</p>
                  {triggeredAlerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20 mb-1">
                      <div className="flex items-center gap-2">
                        <BellRing className="h-3.5 w-3.5 text-primary" />
                        <div>
                          <p className="text-xs text-foreground">{alert.pair} {alert.direction === "above" ? "↑" : "↓"} {alert.targetPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => removeAlert(alert.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display"><Bell className="h-5 w-5 text-primary" /> Set Price Alert</DialogTitle>
            <DialogDescription>Get notified when a market pair reaches your target price.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Market Pair</label>
              <select
                value={newPair}
                onChange={e => setNewPair(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                {pairs.map(p => (
                  <option key={p} value={p}>{p} {currentPrices[p] ? `— ${currentPrices[p].toLocaleString(undefined, { maximumFractionDigits: 4 })}` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Target Price</label>
              <Input type="number" placeholder="0.00" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={newDirection === "above" ? "default" : "outline"}
                  size="sm"
                  className={newDirection === "above" ? "bg-success text-primary-foreground" : ""}
                  onClick={() => setNewDirection("above")}
                >
                  <ArrowUp className="h-3 w-3 mr-1" /> Above
                </Button>
                <Button
                  variant={newDirection === "below" ? "default" : "outline"}
                  size="sm"
                  className={newDirection === "below" ? "bg-destructive text-destructive-foreground" : ""}
                  onClick={() => setNewDirection("below")}
                >
                  <ArrowDown className="h-3 w-3 mr-1" /> Below
                </Button>
              </div>
            </div>
            <Button className="w-full bg-primary text-primary-foreground font-semibold" onClick={addAlert}>
              Set Alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PriceAlerts;
