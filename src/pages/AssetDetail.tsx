import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  User, 
  History as HistoryIcon, 
  Edit3, 
  Calendar,
  Hash,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Asset {
  id: string; code: string; name: string; status: string;
  description: string | null; serial_number: string | null;
  department_id: string; item_type_id: string;
  current_holder: string | null; current_location_id: string | null;
  image_url: string | null;
}

interface AssetHistory {
  id: string;
  action: string;
  created_at: string;
  notes: string | null;
  performed_by_name?: string;
  to_user_name?: string;
}

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<AssetHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSerial, setEditSerial] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadAsset = async () => {
    setLoading(true);
    try {
      // Fetch asset with related names
      const { data: a, error } = await supabase
        .from("assets")
        .select(`
          *,
          department:departments!assets_department_id_fkey(name),
          item_type:item_types!assets_item_type_id_fkey(name),
          location:departments!assets_current_location_id_fkey(name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setAsset(a as any);
      setEditName(a.name);
      setEditDesc(a.description || "");
      setEditSerial(a.serial_number || "");
      setEditImageUrl(a.image_url || "");

      // Fetch history with profiles
      const { data: h, error: hErr } = await supabase
        .from("asset_history")
        .select(`
          id, action, created_at, notes,
          performed_by:profiles!asset_history_performed_by_fkey(display_name),
          to_user:profiles!asset_history_to_user_fkey(display_name)
        `)
        .eq("asset_id", id)
        .order("created_at", { ascending: false });

      if (hErr) throw hErr;
      setHistory(h.map((x: any) => ({
        ...x,
        performed_by_name: x.performed_by?.display_name,
        to_user_name: x.to_user?.display_name
      })));

    } catch (err: any) {
      toast.error(err.message);
      navigate("/assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) loadAsset(); }, [id]);

  const handleUpdate = async () => {
    if (!asset) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("assets")
        .update({
          name: editName,
          description: editDesc || null,
          serial_number: editSerial || null,
          image_url: editImageUrl || null
        } as any)
        .eq("id", asset.id);

      if (error) throw error;
      toast.success("Asset profile updated");
      loadAsset();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center font-mono text-primary animate-pulse tracking-widest uppercase">Decyphering Asset Data...</div>;
  if (!asset) return null;

  const statusMap: Record<string, { label: string, color: string, icon: any }> = {
    available: { label: "Available", color: "text-primary border-primary/40 bg-primary/10", icon: CheckCircle2 },
    signed_out: { label: "Sign Out", color: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10", icon: Clock },
    retired: { label: "Damaged", color: "text-rose-400 border-rose-500/40 bg-rose-500/10", icon: AlertTriangle },
  };

  const currentStatus = statusMap[asset.status] || { label: asset.status, color: "text-muted-foreground border-border bg-muted/10", icon: Package };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary transition-colors">
          <Link to="/assets"><ArrowLeft size={16} className="mr-2" /> Back to Registry</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-card/40 border-primary/30 p-6 flex flex-col items-center text-center relative overflow-hidden box-glow-soft">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/30 scanlines" />
            
            {/* WhatsApp style Avatar */}
            <div className="relative group mb-6">
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur group-hover:bg-primary/40 transition duration-500" />
              <div className="relative size-32 md:size-40 rounded-full border-2 border-primary/60 bg-black overflow-hidden flex items-center justify-center box-glow">
                {asset.image_url ? (
                  <img src={asset.image_url} alt={asset.name} className="size-full object-cover" />
                ) : (
                  <Package size={64} className="text-primary/20" />
                )}
              </div>
            </div>

            <h1 className="font-display text-2xl text-primary glow tracking-tight mb-1">{asset.name}</h1>
            <div className="font-mono text-sm text-primary/60 mb-4 tracking-widest uppercase">{asset.code}</div>
            
            <Badge variant="outline" className={cn("px-4 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-[0.2em]", currentStatus.color)}>
              <currentStatus.icon size={12} className="mr-2" />
              {currentStatus.label}
            </Badge>

            <div className="w-full h-px bg-primary/10 my-6" />

            <div className="grid grid-cols-1 gap-4 w-full text-left font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase tracking-widest">Division</span>
                <span className="text-foreground">{(asset as any).item_type?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase tracking-widest">Base Loc</span>
                <span className="text-foreground">{(asset as any).department?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase tracking-widest">Current Loc</span>
                <span className="text-foreground">{(asset as any).location?.name || "—"}</span>
              </div>
            </div>

            {isAdmin && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-8 border-primary/40 text-primary hover:bg-primary/10 font-mono text-[10px] uppercase tracking-widest">
                    <Edit3 size={14} className="mr-2" /> Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-primary/40">
                  <DialogHeader><DialogTitle className="font-display text-primary">Edit Asset Profile</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Display Name</Label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-primary/5 border-primary/20" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="bg-primary/5 border-primary/20" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Serial Number</Label>
                      <Input value={editSerial} onChange={(e) => setEditSerial(e.target.value)} className="bg-primary/5 border-primary/20" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Image URL (Local path: /assets/photos/filename.jpg)</Label>
                      <Input value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} className="bg-primary/5 border-primary/20" />
                    </div>
                    <Button onClick={handleUpdate} disabled={updating} className="w-full bg-primary text-black">
                      {updating ? "Updating..." : "Save Changes"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </Card>
        </div>

        {/* Right Column: Details & History */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/40 border-primary/30 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -rotate-45 translate-x-16 -translate-y-16" />
            
            <h2 className="font-display text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-sm">
              <Package size={16} className="text-primary/60" /> Asset Specifications
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Serial Number</div>
                  <div className="font-mono text-foreground flex items-center gap-2">
                    <Hash size={14} className="text-primary/40" />
                    {asset.serial_number || "NOT RECORDED"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Primary Division</div>
                  <div className="font-mono text-foreground flex items-center gap-2">
                    <div className="size-1.5 bg-primary rounded-full" />
                    {(asset as any).item_type?.name}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Base Department</div>
                  <div className="font-mono text-foreground flex items-center gap-2">
                    <MapPin size={14} className="text-primary/40" />
                    {(asset as any).department?.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Current Custodian</div>
                  <div className="font-mono text-foreground flex items-center gap-2">
                    <User size={14} className="text-primary/40" />
                    {asset.current_holder ? "OPERATIVE ASSIGNED" : "TERMINAL STORAGE"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-primary/10">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Technical Description / Notes</div>
              <p className="text-sm leading-relaxed text-foreground/80 font-mono">
                {asset.description || "// NO TECHNICAL DESCRIPTION LOADED IN DATABASE."}
              </p>
            </div>
          </Card>

          <Card className="bg-card/40 border-primary/30 p-6">
            <h2 className="font-display text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-sm">
              <HistoryIcon size={16} className="text-primary/60" /> Operation Logs
            </h2>
            
            <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
              {history.length === 0 && (
                <div className="text-center py-12 border border-dashed border-primary/20 rounded font-mono text-xs text-muted-foreground uppercase tracking-widest">
                  // NO HISTORICAL DATA FOUND FOR THIS UNIT
                </div>
              )}
              {history.map((h, i) => (
                <div key={h.id} className="relative pl-6 pb-6 last:pb-0 border-l border-primary/20">
                  {/* Timeline Dot */}
                  <div className="absolute left-[-5px] top-1.5 size-2.5 rounded-full bg-primary/40 border border-primary/60 box-glow-soft" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <Badge variant="outline" className="w-fit font-mono text-[9px] uppercase tracking-tighter border-primary/30 text-primary">
                      {h.action.replace("_", " ")}
                    </Badge>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      <Calendar size={12} />
                      {new Date(h.created_at).toLocaleDateString()}
                      <Clock size={12} className="ml-1" />
                      {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <div className="text-xs font-mono text-foreground/80 mb-1">
                    Operative: <span className="text-primary/70">{h.performed_by_name || "SYSTEM"}</span>
                    {h.to_user_name && <span> → Receiver: <span className="text-primary/70">{h.to_user_name}</span></span>}
                  </div>
                  
                  {h.notes && (
                    <div className="text-[11px] font-mono text-muted-foreground italic bg-primary/5 p-2 rounded border-l border-primary/30 mt-2">
                      &gt; {h.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
