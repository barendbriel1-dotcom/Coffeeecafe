import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, ChevronRight, History, Package, PackageCheck, Sparkles, XCircle } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Stats {
  total: number;
  available: number;
  signedOut: number;
  activeSignouts: number;
  damaged: number;
}

interface ActivityRow {
  id: string;
  action: string;
  created_at: string;
  asset_code?: string;
}

export default function Dashboard() {
  const { isAdmin, isStaff } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, available: 0, signedOut: 0, activeSignouts: 0, damaged: 0 });
  const [activity, setActivity] = useState<ActivityRow[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: total }, { count: available }, { count: signedOut }, { count: activeSignouts }, { count: damaged }, { data: history }] = await Promise.all([
        supabase.from("assets").select("*", { count: "exact", head: true }),
        supabase.from("assets").select("*", { count: "exact", head: true }).eq("status", "available"),
        supabase.from("assets").select("*", { count: "exact", head: true }).eq("status", "signed_out"),
        supabase.from("signouts").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("assets").select("*", { count: "exact", head: true }).eq("status", "retired"),
        supabase.from("asset_history").select("id, action, created_at, assets(code)").order("created_at", { ascending: false }).limit(8),
      ]);

      setStats({
        total: total ?? 0,
        available: available ?? 0,
        signedOut: signedOut ?? 0,
        activeSignouts: activeSignouts ?? 0,
        damaged: damaged ?? 0,
      });

      setActivity(
        (history ?? []).map((entry: any) => ({
          id: entry.id,
          action: entry.action,
          created_at: entry.created_at,
          asset_code: entry.assets?.code,
        })),
      );
    })();
  }, []);

  const role = isAdmin ? "Admin" : isStaff ? "Staff" : "Volunteer";

  const tiles = [
    { label: "Total assets", value: stats.total, icon: Package, accent: "bg-slate-900 text-white", to: "/assets" },
    { label: "Available now", value: stats.available, icon: PackageCheck, accent: "bg-emerald-100 text-emerald-700", to: "/assets?status=available" },
    { label: "Signed out", value: stats.signedOut, icon: AlertTriangle, accent: "bg-amber-100 text-amber-700", to: "/assets?status=signed_out" },
    { label: "Damaged", value: stats.damaged, icon: XCircle, accent: "bg-rose-100 text-rose-700", to: "/assets?status=retired" },
    { label: "Open sign-outs", value: stats.activeSignouts, icon: History, accent: "bg-sky-100 text-sky-700", to: "/history" },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="app-panel-strong overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="app-kicker">Operations snapshot</div>
            <h1 className="app-title">Keep every asset visible, accountable, and ready.</h1>
            <p className="app-subtitle">
              Track availability, open sign-outs, and recent movement from one cleaner dashboard. Signed out, damaged, and active handover work all stay in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-[1.5rem] bg-slate-900 px-4 py-3 text-white shadow-lg">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">Access level</div>
              <div className="font-display text-xl">{role}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {tiles.map((tile) => (
          <Link key={tile.label} to={tile.to} className="app-panel group p-5 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-strong)]">
            <div className="mb-6 flex items-center justify-between">
              <div className={cn("flex size-12 items-center justify-center rounded-2xl", tile.accent)}>
                <tile.icon size={20} />
              </div>
              <ChevronRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <div className="font-display text-4xl font-semibold text-foreground">{tile.value}</div>
            <div className="mt-2 text-sm text-muted-foreground">{tile.label}</div>
          </Link>
        ))}
      </section>

      <section className="app-panel p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="app-kicker">Recent activity</div>
            <h2 className="font-display text-2xl text-foreground">Latest asset events</h2>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-sm text-accent-foreground sm:flex">
            <Activity size={14} />
            Live feed
          </div>
        </div>

        {activity.length === 0 ? (
          <div className="rounded-[1.5rem] bg-secondary/65 px-6 py-12 text-center text-sm text-muted-foreground">
            No asset activity has been recorded yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {activity.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-3 rounded-[1.35rem] bg-secondary/55 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="font-display text-lg text-foreground">{entry.asset_code ?? "Unknown asset"}</div>
                  <div className="text-sm capitalize text-muted-foreground">{entry.action.replace(/_/g, " ")}</div>
                </div>
                <div className="shrink-0 text-sm text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
