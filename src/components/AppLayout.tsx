import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Inbox,
  Layers,
  LayoutGrid,
  LogIn,
  LogOut,
  Menu,
  Package,
  Shield,
  Sparkles,
  Terminal,
  Users as UsersIcon,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const { user, isAdmin, isStaff, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setDisplayName(data?.display_name ?? user.email ?? ""));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const nav = [
    { to: "/", label: "Dashboard", icon: LayoutGrid, show: true },
    { to: "/assets", label: "Assets", icon: Package, show: true },
    { to: "/signout", label: "Sign out", icon: LogOut, show: isStaff },
    { to: "/signout/bulk", label: "Bulk sign out", icon: Layers, show: isStaff },
    { to: "/signin", label: "Sign in", icon: LogIn, show: isAdmin },
    { to: "/handover", label: "Handovers", icon: ArrowLeftRight, show: true },
    { to: "/requests", label: "Requests", icon: Inbox, show: true },
    { to: "/history", label: "History", icon: History, show: true },
    { to: "/admin", label: "Admin", icon: Shield, show: isAdmin },
    { to: "/users", label: "Users", icon: UsersIcon, show: isAdmin },
  ].filter((entry) => entry.show);

  const roleLabel = isAdmin ? "Admin" : isStaff ? "Staff" : "Volunteer";
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const SidebarInner = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className={cn("flex items-center gap-3 border-b border-white/10 p-5", collapsed && "justify-center px-3")}>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[0_12px_26px_hsl(var(--primary)/0.22)]">
          <Terminal size={18} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display text-base font-semibold tracking-tight text-white">Assets Hub</div>
            <div className="text-[11px] text-white/55">Inventory operations</div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {nav.map((entry) => (
          <NavLink
            key={entry.to}
            to={entry.to}
            end={entry.to === "/"}
            onClick={onNavigate}
            title={collapsed ? entry.label : undefined}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all",
                collapsed && "justify-center px-3",
                isActive ? "bg-white text-slate-900 shadow-lg" : "text-white/68 hover:bg-white/8 hover:text-white",
              )
            }
          >
            <entry.icon size={16} className="shrink-0" />
            {!collapsed && <span className="truncate">{entry.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((value) => !value)}
        className="hidden items-center justify-center gap-2 border-t border-white/10 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/55 transition hover:bg-white/5 hover:text-white md:flex"
      >
        {collapsed ? <ChevronRight size={14} /> : (<><ChevronLeft size={14} /> Collapse</>)}
      </button>
    </>
  );

  return (
    <div className="flex min-h-screen bg-transparent text-foreground">
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-white/10 bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <SidebarInner />
      </aside>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-sidebar text-sidebar-foreground md:hidden">
            <SidebarInner onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 rounded-[1.75rem] border border-white/70 bg-background/72 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-3">
              <button className="text-foreground md:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="menu">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/75">Operations overview</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={14} className="opacity-70" />
                  <span className="tabular-nums">{timeStr}</span>
                  <span className="hidden text-primary/35 sm:inline">•</span>
                  <span className="hidden tabular-nums sm:inline">{dateStr}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className={cn(
                  "hidden rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] sm:inline-flex",
                  isAdmin ? "bg-primary/12 text-primary" : isStaff ? "bg-amber-400/15 text-amber-600" : "bg-slate-500/12 text-slate-600",
                )}
              >
                <Shield size={12} className="mr-1.5 opacity-80" />
                {roleLabel}
              </span>

              <span className="hidden max-w-[220px] items-center gap-2 truncate rounded-full bg-card px-3 py-1.5 text-sm text-foreground/80 md:inline-flex">
                <Sparkles size={14} className="text-primary/70" />
                {displayName}
              </span>

              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5 border-destructive/25 bg-card/60 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <LogOut size={14} /> Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-6 sm:px-6 sm:pb-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
