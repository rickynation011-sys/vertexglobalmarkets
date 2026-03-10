import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Phone, Clock } from "lucide-react";

const DashboardContact = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Contact Us</h1>
        <p className="text-muted-foreground text-sm">Get in touch with our support team</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Mail, label: "Email Support", value: "support@vertexglobal.com", sub: "Response within 2 hours" },
          { icon: Phone, label: "Phone Support", value: "+1 (800) 555-VRTX", sub: "Mon-Fri, 9AM-6PM EST" },
          { icon: Clock, label: "Live Chat", value: "Available 24/7", sub: "Average wait: 2 min" },
        ].map((item) => (
          <Card key={item.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Submit a Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Subject</label>
              <Input placeholder="Brief description of your issue" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Category</label>
              <Select>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Account Issues</SelectItem>
                  <SelectItem value="trading">Trading</SelectItem>
                  <SelectItem value="deposit">Deposit / Withdrawal</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="kyc">KYC Verification</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Message</label>
            <Textarea placeholder="Describe your issue in detail..." className="mt-1 min-h-[120px]" />
          </div>
          <Button className="bg-gradient-brand text-primary-foreground font-semibold">Submit Ticket</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardContact;
