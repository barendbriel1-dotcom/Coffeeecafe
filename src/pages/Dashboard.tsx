import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Package, PackageCheck, AlertTriangle, LogOut, Activity, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  total: number;
  available: number;
  signedOut: number;
  activeSignouts: number;
}

interface ActivityRow {
  id: string;
  action: string;
  created_at: string;
  asset_code?: string;
}

export default function Dashboard() {
  const { isAdmin, isStaff } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, available: 0, signedOut: 0, activeSignouts: 0 });
  const [activity, setActivity] = useState<ActivityRow[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: total }, { count: avail }, { count: out }, { count: active }, { data: hist }] = await Promise.all([
        supabase.from("assets").select("*", { count: "exact", head: true }),
        supabase.from("assets").select("*", { count: "exact", head: true }).eq("status", "available"),
        supabase.from("assets").select("*", { count: "exact", head: true }).eq("status", "signed_out"),
        supabase.from("signouts").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase
          .from("asset_history")
          .select("id, action, created_at, assets(code)")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      setStats({
        total: total ?? 0,
        available: avail ?? 0,
        signedOut: out ?? 0,
        activeSignouts: active ?? 0,
      });
      setActivity(
        (hist ?? []).map((h: any) => ({
          id: h.id,
          action: h.action,
          created_at: h.created_at,
          asset_code: h.assets?.code,
        }))
      );
    })();
  }, []);

  const role = isAdmin ? "ADMIN" : isStaff ? "STAFF" : "VOLUNTEER";

  const tiles = [
    { label: "Total Assets", value: stats.total, icon: Package, accent: "primary", to: "/assets" },
    { label: "Available", value: stats.available, icon: PackageCheck, accent: "cyan", to: "/assets" },
    { label: "Signed Out", value: stats.signedOut, icon: AlertTriangle, accent: "red", to: "/assets" },
    { label: "Active Sign-Outs", value: stats.activeSignouts, icon: LogOut, accent: "amber", to: "/signout" },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-primary glow flex items-center gap-2">
            <span className="text-primary/60">$</span> SYSTEM DASHBOARD
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 uppercase tracking-wider">
            // asset management overview · access level: <span className="text-primary">{role}</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-primary/80 uppercase tracking-widest">
          <Activity size={12} className="animate-pulse" />
          system online
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {tiles.map((t) => (
          <StatTile key={t.label} {...t} />
        ))}
      </div>

      {/* Recent Activity */}
      <BracketCard title="Recent Activity">
        {activity.length === 0 ? (
          <div className="py-12 text-center font-mono text-sm text-muted-foreground/70">
            // NO RECORDS FOUND
          </div>
        ) : (
          <ul className="divide-y divide-primary/10">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 px-1 font-mono text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-primary/60">▸</span>
                  <span className="text-primary truncate">{a.asset_code ?? "—"}</span>
                  <span className="text-muted-foreground uppercase text-xs tracking-wider truncate">{a.action}</span>
                </div>
                <span className="text-[11px] text-muted-foreground/70 tabular-nums shrink-0">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </BracketCard>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  accent,
  to,
}: {
  label: string;
  value: number;
  icon: any;
  accent: "primary" | "cyan" | "red" | "amber";
  to: string;
}) {
  const palette = {
    primary: { border: "border-primary/40 hover:border-primary", text: "text-primary", iconBg: "bg-primary/10 border-primary/40" },
    cyan: { border: "border-cyan-500/40 hover:border-cyan-400", text: "text-cyan-400", iconBg: "bg-cyan-500/10 border-cyan-500/40" },
    red: { border: "border-red-500/40 hover:border-red-400", text: "text-red-400", iconBg: "bg-red-500/10 border-red-500/40" },
    amber: { border: "border-amber-500/40 hover:border-amber-400", text: "text-amber-400", iconBg: "bg-amber-500/10 border-amber-500/40" },
  }[accent];

  return (
    <Link
      to={to}
      className={cn(
        "group relative block rounded border bg-card/40 p-4 transition-all hover:bg-card/60",
        palette.border
      )}
    >
      {/* corner brackets */}
      <Corner className="top-0 left-0 border-l border-t" />
      <Corner className="top-0 right-0 border-r border-t" />
      <Corner className="bottom-0 left-0 border-l border-b" />
      <Corner className="bottom-0 right-0 border-r border-b" />

      <div className="flex items-center gap-4">
        <div className={cn("size-12 shrink-0 rounded border flex items-center justify-center", palette.iconBg)}>
          <Icon size={22} className={palette.text} />
        </div>
        <div className="min-w-0">
          <div className={cn("font-display text-3xl leading-none", palette.text)}>{value}</div>
          <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest mt-2">
            {label}
          </div>
        </div>
        <ChevronRight
          size={16}
          className="ml-auto text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition"
        />
      </div>
    </Link>
  );
}

function Corner({ className }: { className?: string }) {
  return <span className={cn("absolute size-2 border-primary/60", className)} />;
}

function BracketCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative rounded border border-primary/30 bg-card/30">
      <div className="border-b border-primary/30 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-primary">
        <span className="text-primary/60 mr-1">&gt;</span> {title}
      </div>
      <div className="p-4 min-h-[160px]">{children}</div>
    </div>
  );
}
