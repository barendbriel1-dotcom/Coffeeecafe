import { Link, Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

import MatrixRain from "@/components/MatrixRain";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface ApprovalPendingProps {
  allowSignOut?: boolean;
  onSignOut?: () => Promise<void> | void;
}

export default function ApprovalPending({
  allowSignOut = false,
  onSignOut,
}: ApprovalPendingProps) {
  const { session, loading, isApproved, isAdmin } = useAuth();

  if (!loading && !session) {
    return <Navigate to="/login" replace />;
  }

  if (!loading && session && (isApproved || isAdmin)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <MatrixRain interactive className="opacity-100" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_24%),linear-gradient(180deg,rgba(2,8,5,0.18),rgba(2,8,5,0.58))]" />

      <section className="scanlines relative z-10 w-full max-w-xl overflow-hidden rounded-[2rem] border border-primary/20 bg-background/95 p-8 text-center shadow-[var(--shadow-strong)] sm:p-10">
        <div className="absolute inset-x-0 top-0 h-px bg-primary/30" />
        <div className="mx-auto flex size-16 items-center justify-center rounded-[1.5rem] border border-primary/25 bg-primary/10 text-primary shadow-[0_0_32px_rgba(34,197,94,0.18)]">
          <ShieldAlert className="size-8" />
        </div>

        <div className="mt-6 space-y-4">
          <div className="app-kicker">Operator queue</div>
          <h1 className="font-display text-4xl text-foreground glow-soft sm:text-5xl">
            Waiting for approval
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
            Your operator profile has been created and is currently waiting for an administrator to approve access and assign your role.
          </p>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-primary/20 bg-primary/8 px-5 py-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary/70">
            // decyphering code //
          </div>
          <div className="mt-3 font-mono text-xs uppercase tracking-[0.22em] text-primary/90">
            Account created. Access remains locked until approval is granted.
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" className="border-primary/30 bg-background/40 text-primary hover:bg-primary/10">
            <Link to="/login">Login Oporator Access</Link>
          </Button>
          {allowSignOut && (
            <Button onClick={() => onSignOut?.()} className="sm:min-w-[180px]">
              Sign out
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
