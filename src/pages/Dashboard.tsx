import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, ChevronRight, History, Package, PackageCheck, XCircle } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { normalizeAssetStatus } from "@/lib/assets";
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
  asset_name?: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, available: 0, signedOut: 0, activeSignouts: 0, damaged: 0 });
  const [activity, setActivity] = useState<ActivityRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: assets, error: assetsError }, { count: activeSignouts }, { data: history, error: historyError }] = await Promise.all([
          supabase.from("assets").select("id, status"),
          supabase.from("signouts").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("asset_history").select("id, action, created_at, assets(code, name)").order("created_at", { ascending: false }).limit(8),
        ]);

        if (assetsError) throw assetsError;
        if (historyError) throw historyError;

        const normalizedAssets = (assets ?? []).map((asset) => normalizeAssetStatus(asset.status));

        setStats({
          total: assets?.length ?? 0,
          available: normalizedAssets.filter((status) => status === "available").length,
          signedOut: normalizedAssets.filter((status) => status === "signed_out").length,
          activeSignouts: activeSignouts ?? 0,
          damaged: normalizedAssets.filter((status) => status === "damaged").length,
        });

        setActivity(
          (history ?? []).map((entry: any) => ({
            id: entry.id,
            action: entry.action,
            created_at: entry.created_at,
            asset_code: entry.assets?.code,
            asset_name: entry.assets?.name,
          })),
        );
      } catch {
        setStats({ total: 0, available: 0, signedOut: 0, activeSignouts: 0, damaged: 0 });
        setActivity([]);
      }
    })();
  }, []);

  const tiles = [
    { label: "Total assets", value: stats.total, icon: Package, accent: "border-primary/24 bg-primary/10 text-primary", to: "/assets" },
    { label: "Available now", value: stats.available, icon: PackageCheck, accent: "border-emerald-500/24 bg-emerald-500/10 text-emerald-300", to: "/assets?status=available" },
    { label: "Signed out", value: stats.signedOut, icon: AlertTriangle, accent: "border-amber-500/24 bg-amber-500/10 text-amber-300", to: "/assets?status=signed_out" },
    { label: "Damaged", value: stats.damaged, icon: XCircle, accent: "border-rose-500/24 bg-rose-500/10 text-rose-300", to: "/assets?status=damaged" },
    { label: "History", value: stats.activeSignouts, icon: History, accent: "border-cyan-500/24 bg-cyan-500/10 text-cyan-300", to: "/history" },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {tiles.map((tile) => (
          <Link key={tile.label} to={tile.to} className="app-panel group p-5 transition-all hover:-translate-y-1 hover:border-primary/24 hover:shadow-[0_0_40px_hsl(var(--primary)/0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div className={cn("flex size-12 items-center justify-center rounded-2xl border", tile.accent)}>
                <tile.icon size={20} />
              </div>
              <ChevronRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <div className="font-display text-4xl font-semibold text-foreground glow-soft">{tile.value}</div>
            <div className="mt-2 font-mono text-sm uppercase tracking-[0.14em] text-muted-foreground">{tile.label}</div>
          </Link>
        ))}
      </section>

      <section className="app-panel p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="app-kicker">Recent activity</div>
            <h2 className="font-display text-2xl text-foreground glow-soft">Latest asset events</h2>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-primary/18 bg-primary/8 px-3 py-1.5 font-mono text-sm text-primary sm:flex">
            <Activity size={14} />
            Live feed
          </div>
        </div>

        {activity.length === 0 ? (
          <div className="rounded-[1.5rem] border border-primary/12 bg-secondary/65 px-6 py-12 text-center text-sm text-muted-foreground">
            No asset activity has been recorded yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {activity.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-3 rounded-[1.35rem] border border-primary/10 bg-secondary/55 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="font-display text-lg text-foreground glow-soft">
                    {entry.asset_code
                      ? `${entry.asset_code}${entry.asset_name ? ` · ${entry.asset_name}` : ""}`
                      : entry.asset_name ?? "Unknown asset"}
                  </div>
                  <div className="font-mono text-sm capitalize text-muted-foreground">{entry.action.replace(/_/g, " ")}</div>
                </div>
                <div className="shrink-0 font-mono text-sm text-muted-foreground">
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
