import { FormEvent, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  History,
  Inbox,
  Layers,
  LayoutGrid,
  LogIn,
  LogOut,
  Menu,
  Package,
  PencilLine,
  Shield,
  X,
} from "lucide-react";

import MatrixRain from "@/components/MatrixRain";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
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

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncHeaderVisibility = () => {
      setHeaderHidden(window.scrollY > 20);
    };

    syncHeaderVisibility();
    window.addEventListener("scroll", syncHeaderVisibility, { passive: true });

    return () => window.removeEventListener("scroll", syncHeaderVisibility);
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

    (async () => {
      const [{ data: profile }, { data: locationRows }] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, phone, department_id")
          .eq("id", user.id)
          .single(),
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
    { to: "/signout", label: "Sign out", icon: LogOut, show: isStaff, exact: true },
    { to: "/groupings", label: "Groupings", icon: Layers, show: isAdmin || isAssetManager, exact: true },
    { to: "/group-signouts", label: "Group signouts", icon: Download, show: isAdmin || isAssetManager, exact: true },
    { to: "/signin", label: "Sign in", icon: LogIn, show: isAdmin || isAssetManager, exact: true },
    { to: "/handover", label: "Handovers", icon: ArrowLeftRight, show: true, exact: true },
    { to: "/requests", label: "Requests", icon: Inbox, show: true, exact: true },
    { to: "/history", label: "History", icon: History, show: true, exact: true },
  ].filter((entry) => entry.show);

  const roleLabel = isAdmin ? "ADMIN" : isAssetManager ? "ASSETS MANAGER" : isStaff ? "STAFF" : "VOLUNTEER";
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const SidebarInner = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className={cn("border-b border-primary/12 p-5", collapsed ? "px-3 text-center" : "px-5")}>
        {collapsed ? (
          <div className="font-display text-2xl font-semibold tracking-tight text-foreground glow-soft">A</div>
        ) : (
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold tracking-tight text-foreground glow-soft">ASSETS</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/52">Inventory operations</div>
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
                isActive
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
        className="hidden items-center justify-center gap-2 border-t border-primary/12 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary/46 transition hover:bg-primary/6 hover:text-primary md:flex"
      >
        {collapsed ? <ChevronRight size={14} /> : (<><ChevronLeft size={14} /> Collapse</>)}
      </button>
    </>
  );

  return (
    <div className="relative isolate flex min-h-screen bg-transparent text-foreground">
      <MatrixRain className="-z-20 opacity-55" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.09),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_24%),linear-gradient(180deg,rgba(5,10,7,0.32),rgba(5,10,7,0.6))]" />

      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-primary/12 bg-sidebar text-sidebar-foreground shadow-[var(--shadow-soft)] transition-[width] duration-200 md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <SidebarInner />
      </aside>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-primary/12 bg-sidebar text-sidebar-foreground shadow-[var(--shadow-strong)] md:hidden">
            <SidebarInner onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {showInstallBanner && isMobileDevice && (
          <div className="px-4 pt-4 sm:px-6">
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-primary/18 bg-card px-4 py-3 shadow-[var(--shadow-soft)]">
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm text-foreground glow-soft">Download Mobile App</div>
                <div className="text-xs text-muted-foreground">
                  {isIosDevice ? "Add this app to your phone dashboard." : "Install this app on your phone dashboard."}
                </div>
              </div>
              <Button type="button" size="sm" onClick={handleInstallClick} className="shrink-0 gap-1.5">
                <Download size={14} /> Download
              </Button>
              <button
                type="button"
                onClick={dismissInstallBanner}
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Dismiss install banner"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <header
          className={cn(
            "sticky top-0 z-30 px-4 py-4 transition-all duration-300 sm:px-6",
            headerHidden ? "pointer-events-none -translate-y-6 opacity-0" : "translate-y-0 opacity-100",
          )}
        >
          <div className="flex items-center justify-between gap-3 rounded-[1.75rem] border border-primary/14 bg-background/92 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-3">
              <button className="text-foreground md:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="menu">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="min-w-0">
                <div className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-primary/80 sm:text-base">Operations overview</div>
                <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground sm:text-base">
                  <Clock size={14} className="opacity-70" />
                  <span className="tabular-nums">{timeStr}</span>
                  <span className="hidden text-primary/35 sm:inline">•</span>
                  <span className="hidden tabular-nums sm:inline">{dateStr}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="hidden rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-primary transition-colors hover:border-primary/45 hover:bg-primary/16 sm:inline-flex"
                >
                  <Shield size={12} className="mr-1.5 opacity-80" />
                  {roleLabel}
                </button>
              ) : (
                <span
                  className={cn(
                    "hidden rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] sm:inline-flex",
                    isStaff
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
                className="hidden max-w-[220px] items-center truncate rounded-full border border-primary/18 bg-card px-4 py-1.5 text-sm text-foreground shadow-[var(--shadow-soft)] transition-colors hover:border-primary/26 hover:bg-card md:inline-flex"
              >
                <span className="truncate">{displayName}</span>
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-1.5 border-destructive/25 bg-card/70 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
        <DialogContent className="rounded-[1.8rem] border-primary/18 bg-card shadow-[var(--shadow-strong)]">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl text-foreground glow-soft">Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">
                Display name
              </Label>
              <Input
                id="profile-name"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="Your name"
                maxLength={80}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email" className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">
                Email address
              </Label>
              <Input id="profile-email" value={user?.email ?? ""} readOnly className="text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-phone" className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">
                Phone number
              </Label>
              <Input
                id="profile-phone"
                value={profilePhone}
                onChange={(event) => setProfilePhone(event.target.value)}
                placeholder="Add your contact number"
                maxLength={30}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">
                Home base
              </Label>
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
              <Button type="button" variant="outline" onClick={() => setProfileOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={profileSaving} className="gap-2">
                <PencilLine size={16} />
                {profileSaving ? "Saving..." : "Save profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
