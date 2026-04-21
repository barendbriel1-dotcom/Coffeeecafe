import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  PackageMinus,
  PackageOpen,
  ArrowLeftRight,
  Inbox,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const { user, isAdmin, isStaff, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const nav = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, show: true },
    { to: "/assets", label: "Assets", icon: Package, show: true },
    { to: "/signout", label: "Sign Out", icon: PackageMinus, show: isStaff },
    { to: "/signout/bulk", label: "Bulk Package", icon: PackageOpen, show: isStaff },
    { to: "/handover", label: "Handovers", icon: ArrowLeftRight, show: true },
    { to: "/requests", label: "Requests", icon: Inbox, show: true },
    { to: "/admin", label: "Admin", icon: Shield, show: isAdmin },
  ].filter((n) => n.show);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-primary/30 bg-background/95 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-primary"
            onClick={() => setOpen((o) => !o)}
            aria-label="menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="font-display text-lg text-primary glow">
            <span className="opacity-70">[</span> ENCOUNTER<span className="text-foreground/70">.assets</span> <span className="opacity-70">]</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[180px]">
            {user?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-primary hover:bg-primary/10">
            <LogOut size={16} className="mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-primary/20 bg-card/50 p-3 gap-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary glow-soft border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )
              }
            >
              <n.icon size={16} />
              {n.label}
            </NavLink>
          ))}
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden fixed inset-0 top-14 z-30 bg-background/95 backdrop-blur p-4">
            <nav className="flex flex-col gap-2">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded border border-primary/20 px-4 py-3 text-base",
                      isActive ? "bg-primary/15 text-primary glow-soft" : "text-foreground"
                    )
                  }
                >
                  <n.icon size={18} />
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
