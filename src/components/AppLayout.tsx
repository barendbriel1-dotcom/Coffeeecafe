import { FormEvent, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  History,
  Heart,
  Inbox,
  Layers,
  LayoutGrid,
  LogIn,
  LogOut,
  Menu,
  Package,
  PlugZap,
  PencilLine,
  Shield,
  Users,
  X,
} from "lucide-react";

import MatrixRain from "@/components/MatrixRain";
import DamageReportDialog from "@/components/DamageReportDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LocationOption {
  id: string;
  name: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function AppLayout() {
  const { user, isAdmin, isStaff, isAssetManager, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [displayName, setDisplayName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileDepartmentId, setProfileDepartmentId] = useState("none");
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const isWeddingPage = location.pathname === "/wedding";

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const installBannerDismissed = window.localStorage.getItem("assets-install-banner-dismissed") === "true";
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");

    const syncDeviceState = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      const isIos = /iphone|ipad|ipod/.test(ua);
      const mobile = mobileQuery.matches || /android|iphone|ipad|ipod|mobile/.test(ua);
      const standalone = standaloneQuery.matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

      setIsIosDevice(isIos);
      setIsMobileDevice(mobile);
      setIsStandalone(standalone);
      setShowInstallBanner(mobile && !standalone && !installBannerDismissed);
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
      syncDeviceState();
    };

    const handleInstalled = () => {
      setDeferredInstallPrompt(null);
      setShowInstallBanner(false);
      window.localStorage.setItem("assets-install-banner-dismissed", "true");
      syncDeviceState();
    };

    syncDeviceState();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    mobileQuery.addEventListener("change", syncDeviceState);
    standaloneQuery.addEventListener("change", syncDeviceState);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      mobileQuery.removeEventListener("change", syncDeviceState);
      standaloneQuery.removeEventListener("change", syncDeviceState);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    void (async () => {
      const [{ data: profile }, { data: locationRows }] = await Promise.all([
        supabase.from("profiles").select("display_name, phone, department_id").eq("id", user.id).single(),
        supabase.from("locations").select("id, name").order("name"),
      ]);

      const nextName = profile?.display_name ?? user.email ?? "";
      setDisplayName(nextName);
      setProfileName(nextName);
      setProfilePhone(profile?.phone ?? "");
      setProfileDepartmentId(profile?.department_id ?? "none");
      setLocations(locationRows ?? []);
    })();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || profileSaving) return;

    const trimmedName = profileName.trim();
    if (!trimmedName) {
      toast.error("Display name is required");
      return;
    }

    setProfileSaving(true);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? null,
      display_name: trimmedName,
      phone: profilePhone.trim() || null,
      department_id: profileDepartmentId === "none" ? null : profileDepartmentId,
    });

    setProfileSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setDisplayName(trimmedName);
    setProfileOpen(false);
    toast.success("Profile updated");
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    window.localStorage.setItem("assets-install-banner-dismissed", "true");
  };

  const handleInstallClick = async () => {
    if (deferredInstallPrompt) {
      await deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === "accepted") {
        dismissInstallBanner();
      }
      setDeferredInstallPrompt(null);
      return;
    }

    if (isIosDevice) {
      navigate("/install");
      return;
    }

    toast.info("Use your browser menu and choose Install app or Add to Home screen.");
  };

  const nav = [
    { to: "/", label: "Dashboard", icon: LayoutGrid, show: true, exact: true },
    { to: "/assets", label: "Assets", icon: Package, show: true, exact: false },
    { to: "/consumables", label: "Consumables", icon: PlugZap, show: isAdmin || isAssetManager, exact: true },
    { to: "/signout", label: "Sign out", icon: LogOut, show: isStaff, exact: true },
    { to: "/group-signouts", label: "Group signouts", icon: Download, show: isAdmin || isAssetManager, exact: true },
    { to: "/signin", label: "Sign in", icon: LogIn, show: isAdmin || isAssetManager, exact: true },
    { to: "/groupings", label: "Groupings", icon: Layers, show: isAdmin || isAssetManager, exact: true },
    { to: "/requests", label: "Requests", icon: Inbox, show: true, exact: true },
    { to: "/handover", label: "Handovers", icon: ArrowLeftRight, show: true, exact: true },
    { to: "/users", label: "Users", icon: Users, show: isAdmin, exact: true },
    { to: "/history", label: "History", icon: History, show: true, exact: true },
    { to: "/wedding", label: "Wedding", icon: Heart, show: user?.email?.toLowerCase() === "barend@encounterchurch.co.za", exact: true },
  ].filter((entry) => entry.show);

  const roleLabel = isAdmin ? "ADMIN" : isAssetManager ? "ASSETS MANAGER" : isStaff ? "STAFF" : "VOLUNTEER";
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const SidebarInner = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "p-5",
          isWeddingPage ? "border-b border-black/10" : "border-b border-primary/12",
          collapsed ? "px-3 text-center" : "px-5",
        )}
      >
        {collapsed ? (
          <div className={cn("font-display text-2xl font-semibold tracking-tight", isWeddingPage ? "text-black" : "text-foreground glow-soft")}>A</div>
        ) : (
          <div className="min-w-0">
            <div className={cn("font-display text-lg font-semibold tracking-tight", isWeddingPage ? "text-black" : "text-foreground glow-soft")}>ASSETS</div>
            <div className={cn("font-mono text-[11px] uppercase tracking-[0.2em]", isWeddingPage ? "text-black/48" : "text-primary/52")}>
              Inventory operations
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {nav.map((entry) => (
          <NavLink
            key={entry.to}
            to={entry.to}
            end={entry.exact}
            onClick={onNavigate}
            title={collapsed ? entry.label : undefined}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all",
                collapsed && "justify-center px-3",
                isWeddingPage
                  ? isActive
                    ? "border border-black/14 bg-black text-white shadow-none"
                    : "text-black/62 hover:bg-black/6 hover:text-black"
                  : isActive
                    ? "border border-primary/20 bg-primary/12 text-primary shadow-[0_0_24px_hsl(var(--primary)/0.1)]"
                    : "text-muted-foreground hover:bg-primary/6 hover:text-foreground",
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
        className={cn(
          "hidden items-center justify-center gap-2 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] transition md:flex",
          isWeddingPage
            ? "border-t border-black/10 text-black/46 hover:bg-black/6 hover:text-black"
            : "border-t border-primary/12 text-primary/46 hover:bg-primary/6 hover:text-primary",
        )}
      >
        {collapsed ? <ChevronRight size={14} /> : (<><ChevronLeft size={14} /> Collapse</>)}
      </button>
    </div>
  );

  return (
    <div className={cn("relative isolate flex min-h-screen bg-transparent text-foreground", isWeddingPage && "text-black")}>
      {!isWeddingPage && <MatrixRain className="-z-20 opacity-55" />}
      <div
        className={cn(
          "pointer-events-none fixed inset-0 -z-10",
          isWeddingPage
            ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,241,235,0.98))]"
            : "bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.09),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_24%),linear-gradient(180deg,rgba(5,10,7,0.32),rgba(5,10,7,0.6))]",
        )}
      />

      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col transition-[width] duration-200 md:flex",
          isWeddingPage
            ? "border-r border-black/10 bg-white/90 text-black shadow-[0_16px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl"
            : "border-r border-primary/12 bg-sidebar text-sidebar-foreground shadow-[var(--shadow-soft)]",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <SidebarInner />
      </aside>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col md:hidden",
              isWeddingPage
                ? "border-r border-black/10 bg-white/95 text-black shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
                : "border-r border-primary/12 bg-sidebar text-sidebar-foreground shadow-[var(--shadow-strong)]",
            )}
          >
            <SidebarInner onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {showInstallBanner && isMobileDevice && (
          <div className="px-4 pt-4 sm:px-6">
            <div className={cn("flex items-center gap-3 rounded-[1.5rem] px-4 py-3", isWeddingPage ? "border border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]" : "border border-primary/18 bg-card shadow-[var(--shadow-soft)]")}>
              <div className="min-w-0 flex-1">
                <div className={cn("font-display text-sm", isWeddingPage ? "text-black" : "text-foreground glow-soft")}>Download Mobile App</div>
                <div className={cn("text-xs", isWeddingPage ? "text-black/60" : "text-muted-foreground")}>
                  {isIosDevice ? "Add this app to your phone dashboard." : "Install this app on your phone dashboard."}
                </div>
              </div>
              <Button type="button" size="sm" onClick={handleInstallClick} className={cn("shrink-0 gap-1.5", isWeddingPage && "border-black bg-black text-white hover:bg-white hover:text-black")}>
                <Download size={14} /> Download
              </Button>
              <button
                type="button"
                onClick={dismissInstallBanner}
                className={cn("shrink-0 transition-colors", isWeddingPage ? "text-black/52 hover:text-black" : "text-muted-foreground hover:text-foreground")}
                aria-label="Dismiss install banner"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <header className="sticky top-0 z-30 px-4 py-4 sm:px-6">
          <div
            className={cn(
              "flex items-center justify-between gap-3 rounded-[1.75rem] px-4 py-3 backdrop-blur-xl",
              isWeddingPage
                ? "border border-black/10 bg-white/88 shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                : "border border-primary/14 bg-background/92 shadow-[var(--shadow-soft)]",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <button className={cn("md:hidden", isWeddingPage ? "text-black" : "text-foreground")} onClick={() => setMobileOpen((value) => !value)} aria-label="menu">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="min-w-0">
                <div className={cn("font-display text-sm font-semibold uppercase tracking-[0.24em] sm:text-base", isWeddingPage ? "text-black/82" : "text-primary/80")}>
                  Operations overview
                </div>
                <div className={cn("flex items-center gap-2 font-mono text-sm sm:text-base", isWeddingPage ? "text-black/62" : "text-muted-foreground")}>
                  <Clock size={14} className="opacity-70" />
                  <span className="tabular-nums">{timeStr}</span>
                  <span className={cn("hidden sm:inline", isWeddingPage ? "text-black/30" : "text-primary/35")}>•</span>
                  <span className="hidden tabular-nums sm:inline">{dateStr}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className={cn(
                    "hidden rounded-full px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] transition-colors sm:inline-flex",
                    isWeddingPage
                      ? "border border-black bg-black text-white hover:bg-white hover:text-black"
                      : "border border-primary/30 bg-primary/10 text-primary hover:border-primary/45 hover:bg-primary/16",
                  )}
                >
                  <Shield size={12} className="mr-1.5 opacity-80" />
                  {roleLabel}
                </button>
              ) : (
                <span
                  className={cn(
                    "hidden rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] sm:inline-flex",
                    isWeddingPage
                      ? "border-black/18 bg-white text-black"
                      : isStaff
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        : "border-primary/14 bg-muted/80 text-muted-foreground",
                  )}
                >
                  <Shield size={12} className="mr-1.5 opacity-80" />
                  {roleLabel}
                </span>
              )}

              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className={cn(
                  "hidden max-w-[220px] items-center truncate rounded-full border px-4 py-1.5 text-sm transition-colors md:inline-flex",
                  isWeddingPage
                    ? "border-black/12 bg-white text-black shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:bg-black hover:text-white"
                    : "border-primary/18 bg-card text-foreground shadow-[var(--shadow-soft)] hover:border-primary/26 hover:bg-card",
                )}
              >
                <span className="truncate">{displayName}</span>
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className={cn(
                  "gap-1.5",
                  isWeddingPage
                    ? "border-black bg-white text-black hover:bg-black hover:text-white"
                    : "border-destructive/25 bg-card/70 text-destructive hover:bg-destructive/10 hover:text-destructive",
                )}
              >
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

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent
          className={cn(
            "rounded-[1.8rem]",
            isWeddingPage ? "border-black/12 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.12)]" : "border-primary/18 bg-card shadow-[var(--shadow-strong)]",
          )}
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className={cn("font-display text-3xl", isWeddingPage ? "text-black" : "text-foreground glow-soft")}>Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className={cn("font-mono text-xs uppercase tracking-[0.14em]", isWeddingPage ? "text-black/72" : "text-primary/72")}>
                Display name
              </Label>
              <Input id="profile-name" value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="Your name" maxLength={80} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email" className={cn("font-mono text-xs uppercase tracking-[0.14em]", isWeddingPage ? "text-black/72" : "text-primary/72")}>
                Email address
              </Label>
              <Input id="profile-email" value={user?.email ?? ""} readOnly className="text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-phone" className={cn("font-mono text-xs uppercase tracking-[0.14em]", isWeddingPage ? "text-black/72" : "text-primary/72")}>
                Phone number
              </Label>
              <Input id="profile-phone" value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} placeholder="Add your contact number" maxLength={30} />
            </div>

            <div className="space-y-2">
              <Label className={cn("font-mono text-xs uppercase tracking-[0.14em]", isWeddingPage ? "text-black/72" : "text-primary/72")}>Home base</Label>
              <Select value={profileDepartmentId} onValueChange={setProfileDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a base location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setProfileOpen(false)} className={cn(isWeddingPage && "border-black bg-white text-black hover:bg-black hover:text-white")}>
                Cancel
              </Button>
              <Button type="submit" disabled={profileSaving} className={cn("gap-2", isWeddingPage && "border-black bg-black text-white hover:bg-white hover:text-black")}>
                <PencilLine size={16} />
                {profileSaving ? "Saving..." : "Save profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DamageReportDialog />
    </div>
  );
}
