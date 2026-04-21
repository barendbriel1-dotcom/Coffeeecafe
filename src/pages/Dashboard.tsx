import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Package, ArrowLeftRight, Inbox, PackageMinus } from "lucide-react";

interface Stats {
  total: number;
  available: number;
  signedOut: number;
  myAssets: number;
  pendingHandovers: number;
  pendingRequests: number;
}

export default function Dashboard() {
  const { user, isAdmin, isStaff } = useAuth();
  const [stats, setStats] = useState<Stats>({
    total: 0, available: 0, signedOut: 0, myAssets: 0, pendingHandovers: 0, pendingRequests: 0,
  });
  const [profile, setProfile] = useState<{ display_name: string } | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const [{ count: total }, { count: avail }, { count: out }, { count: mine }, { count: handovers }, { count: reqs }, prof] = await Promise.all([
        supabase.from("assets").select("*", { count: "exact", head: true }),
        supabase.from("assets").select("*", { count: "exact", head: true }).eq("status", "available"),
        supabase.from("assets").select("*", { count: "exact", head: true }).eq("status", "signed_out"),
        supabase.from("assets").select("*", { count: "exact", head: true }).eq("current_holder", user.id),
        supabase.from("handovers").select("*", { count: "exact", head: true }).eq("to_user", user.id).eq("status", "pending"),
        supabase.from("asset_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("display_name").eq("id", user.id).single(),
      ]);
      setStats({
        total: total ?? 0, available: avail ?? 0, signedOut: out ?? 0,
        myAssets: mine ?? 0, pendingHandovers: handovers ?? 0, pendingRequests: reqs ?? 0,
      });
      setProfile(prof.data ?? null);
    })();
  }, [user]);

  const tiles = [
    { label: "Total Assets", value: stats.total, link: "/assets" },
    { label: "Available", value: stats.available, link: "/assets" },
    { label: "Signed Out", value: stats.signedOut, link: "/assets" },
    { label: "Assigned to me", value: stats.myAssets, link: "/assets" },
    { label: "Pending Handovers", value: stats.pendingHandovers, link: "/handover" },
    { label: isAdmin ? "Open Requests" : "My Requests", value: stats.pendingRequests, link: "/requests" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="font-display text-xs text-primary/70">// SYSTEM ONLINE</div>
        <h1 className="font-display text-2xl text-primary glow mt-1">
          Welcome back, {profile?.display_name ?? "operative"}
          <span className="cursor-blink ml-1" />
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Roles active: {isAdmin ? "ADMIN" : isStaff ? "STAFF" : "VOLUNTEER"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tiles.map((t) => (
          <Link key={t.label} to={t.link}>
            <Card className="bg-card/50 border-primary/30 p-4 hover:border-primary hover:box-glow-soft transition-all">
              <div className="text-3xl font-display text-primary glow">{t.value}</div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{t.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <QuickAction to="/assets" icon={Package} label="Browse Assets" />
        {isStaff && <QuickAction to="/signout" icon={PackageMinus} label="Sign Out Asset" />}
        {isStaff && <QuickAction to="/signout/bulk" icon={PackageMinus} label="Bulk Package Sign-Out" />}
        <QuickAction to="/handover" icon={ArrowLeftRight} label="Hand Over" />
        <QuickAction to="/requests" icon={Inbox} label={isAdmin ? "Review Requests" : "Request Asset"} />
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link to={to}>
      <Card className="bg-card/30 border-primary/30 p-4 flex items-center gap-3 hover:border-primary hover:bg-primary/5 transition">
        <Icon size={20} className="text-primary" />
        <span className="font-display text-sm text-foreground">{label}</span>
      </Card>
    </Link>
  );
}
