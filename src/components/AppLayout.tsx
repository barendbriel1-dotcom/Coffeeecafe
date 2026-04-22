import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  Package,
  LogOut,
  LogIn,
  Layers,
  History,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Clock,
  Shield,
  Menu,
  X,
  ArrowLeftRight,
  Inbox,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export default function AppLayout() {
  const { user, isAdmin, isStaff, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("id", user.id).single()
      .then(({ data }) => setDisplayName(data?.display_name ?? user.email ?? ""));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const nav = [
    { to: "/", label: "Dashboard", icon: LayoutGrid, show: true },
    { to: "/assets", label: "Assets", icon: Package, show: true },
    { to: "/signout", label: "Sign Out", icon: LogOut, show: isStaff },
    { to: "/signout/bulk", label: "Bulk Sign Out", icon: Layers, show: isStaff },
    { to: "/signin", label: "Sign In", icon: LogIn, show: isAdmin },
    { to: "/handover", label: "Handovers", icon: ArrowLeftRight, show: true },
    { to: "/requests", label: "Requests", icon: Inbox, show: true },
    { to: "/history", label: "History", icon: History, show: true },
    { to: "/admin", label: "Admin", icon: Shield, show: isAdmin },
    { to: "/users", label: "Users", icon: UsersIcon, show: isAdmin },
  ].filter((n) => n.show);

  const roleLabel = isAdmin ? "ADMIN" : isStaff ? "STAFF" : "VOLUNTEER";
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });

  const SidebarInner = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Brand header */}
      <div className={cn("border-b border-primary/30 p-4 flex items-center gap-3", collapsed && "justify-center px-2")}>
        <div className="size-9 shrink-0 rounded border border-primary/60 bg-primary/10 flex items-center justify-center text-primary box-glow-soft">
          <Terminal size={18} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display text-primary text-base glow tracking-wider">ASSETTRACK</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">system v2.0</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded px-3 py-2.5 text-sm font-mono uppercase tracking-wider transition-all",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-primary/15 text-primary glow-soft border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary border-l-2 border-transparent"
              )
            }
            title={collapsed ? n.label : undefined}
          >
            <n.icon size={16} className="shrink-0" />
            {!collapsed && <span className="truncate">{n.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="hidden md:flex items-center justify-center gap-2 border-t border-primary/30 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
      >
        {collapsed ? <ChevronRight size={14} /> : (<><ChevronLeft size={14} /> Collapse</>)}
      </button>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex shrink-0 flex-col border-r border-primary/30 bg-card/40 transition-[width] duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarInner />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-background/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-primary/30 bg-card">
            <SidebarInner onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Right side */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-primary/30 bg-background/95 px-3 sm:px-5 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden text-primary"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-primary">
              <Clock size={14} className="opacity-70" />
              <span className="tabular-nums">{timeStr}</span>
              <span className="text-primary/40 hidden sm:inline">|</span>
              <span className="tabular-nums hidden sm:inline">{dateStr}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] tracking-widest",
                isAdmin
                  ? "border-primary/60 text-primary box-glow-soft"
                  : isStaff
                  ? "border-yellow-500/60 text-yellow-400"
                  : "border-muted-foreground/40 text-muted-foreground"
              )}
            >
              <Shield size={12} />
              {roleLabel}
            </span>
            <span className="hidden sm:inline font-mono text-sm text-foreground/80 truncate max-w-[160px]">
              {displayName}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive font-mono text-xs uppercase tracking-wider gap-1.5"
            >
              <LogOut size={14} /> Logout
            </Button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
