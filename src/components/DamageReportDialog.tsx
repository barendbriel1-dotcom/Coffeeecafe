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
import { cn } from "@/lib/utils";

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
  const [damagedTime, setDamagedTime] = useState("");
  const [damageType, setDamageType] = useState("");
  const [otherDetails, setOtherDetails] = useState("");
  const [busy, setBusy] = useState(false);

  const activeReport = reports[0] ?? null;

  const damageTypes = [
    "Scratched",
    "Cracked",
    "Broken",
    "Water Damage",
    "Other"
  ];

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

    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  const submit = async () => {
    if (!activeReport) return;

    if (!damagedDate) {
      toast.error("Please select the date the item was damaged.");
      return;
    }

    if (!damagedTime) {
      toast.error("Please select the approximate time the item was damaged.");
      return;
    }

    if (!damageType) {
      toast.error("Please select a damage type.");
      return;
    }

    if (damageType === "Other" && !otherDetails.trim()) {
      toast.error("Please specify the other damage details.");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a description of how it happened.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase
        .from("damage_reports")
        .update({
          description: description.trim(),
          damaged_date: damagedDate,
          damaged_time: damagedTime,
          damage_type: damageType,
          other_details: damageType === "Other" ? otherDetails.trim() : null,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", activeReport.id);

      if (error) throw error;

      toast.success("Damage report submitted. Thank you.");
      setReports((current) => current.filter((r) => r.id !== activeReport.id));
      setDescription("");
      setDamagedDate("");
      setDamagedTime("");
      setDamageType("");
      setOtherDetails("");
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
        className="bg-card sm:max-w-lg [&>button]:hidden max-h-[90vh] overflow-y-auto"
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
            This item was returned as <strong className="text-rose-400">damaged</strong> while
            assigned to you. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-rose-300">{activeReport.asset_code}</span>
              <span className="text-sm text-foreground">{activeReport.asset_name}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Date Damaged</Label>
              <Input
                type="date"
                value={damagedDate}
                onChange={(e) => setDamagedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Approx. Time</Label>
              <Input
                type="time"
                value={damagedTime}
                onChange={(e) => setDamagedTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Damage Type</Label>
            <div className="flex flex-wrap gap-2">
              {damageTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDamageType(type)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-all",
                    damageType === type
                      ? "border-primary bg-primary/20 text-primary glow-soft"
                      : "border-primary/20 bg-card text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {damageType === "Other" && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
              <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Please Specify</Label>
              <Input
                value={otherDetails}
                onChange={(e) => setOtherDetails(e.target.value)}
                placeholder="Details for 'Other'..."
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">
              How did it happen?
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident..."
              rows={3}
              required
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
