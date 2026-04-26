import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PendingReport {
  id: string;
  asset_code: string;
  asset_name: string;
  created_at: string;
}

export default function DamageReportDialog() {
  const { user } = useAuth();
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [description, setDescription] = useState("");
  const [damagedDate, setDamagedDate] = useState("");
  const [busy, setBusy] = useState(false);

  const activeReport = reports[0] ?? null;

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("damage_reports")
        .select("id, asset_code, asset_name, created_at")
        .eq("assigned_to", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      setReports((data as PendingReport[] | null) ?? []);
    };

    load();

    // Re-check every 30 seconds in case an admin marks something damaged
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  const submit = async () => {
    if (!activeReport) return;

    if (!description.trim()) {
      toast.error("Please describe how the item was damaged.");
      return;
    }

    if (!damagedDate) {
      toast.error("Please select the date the item was damaged.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase
        .from("damage_reports")
        .update({
          description: description.trim(),
          damaged_date: damagedDate,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", activeReport.id);

      if (error) throw error;

      toast.success("Damage report submitted. Thank you.");
      setReports((current) => current.filter((r) => r.id !== activeReport.id));
      setDescription("");
      setDamagedDate("");
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to submit damage report.");
    } finally {
      setBusy(false);
    }
  };

  if (!activeReport) return null;

  return (
    <Dialog open onOpenChange={() => { /* prevent closing */ }}>
      <DialogContent
        className="bg-card sm:max-w-lg [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        aria-describedby="damage-report-desc"
      >
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10">
            <AlertTriangle className="h-6 w-6 text-rose-400" />
          </div>
          <DialogTitle className="text-center font-display text-xl text-foreground">
            Damage Report Required
          </DialogTitle>
          <DialogDescription id="damage-report-desc" className="text-center">
            The following item was returned as <strong className="text-rose-400">damaged</strong> while
            assigned to you. Please complete this report before continuing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Asset info */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-rose-300">{activeReport.asset_code}</span>
              <span className="text-sm text-foreground">{activeReport.asset_name}</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Reported on {new Date(activeReport.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Date damaged */}
          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">
              Date damaged
            </Label>
            <Input
              type="date"
              value={damagedDate}
              onChange={(e) => setDamagedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">
              How was this item damaged?
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened and the extent of the damage..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            onClick={submit}
            disabled={busy}
            className="w-full"
          >
            {busy ? "Submitting..." : "Submit Damage Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
