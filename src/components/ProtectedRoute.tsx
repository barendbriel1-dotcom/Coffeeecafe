import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import MatrixRain from "./MatrixRain";
import ApprovalPending from "./ApprovalPending";
import { Button } from "@/components/ui/button";

export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: AppRole;
}) {
  const { session, loading, roles, authError, isAdmin, isStaff, isAssetManager, isApproved, signOut, retryAccessLoad } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background">
        <MatrixRain className="opacity-90" />
        <div className="z-10 rounded-[1.8rem] border border-primary/20 bg-background/58 px-6 py-5 text-center shadow-[var(--shadow-strong)] backdrop-blur-sm">
          <div className="font-display text-2xl text-primary glow tracking-[0.24em] uppercase md:text-4xl">
            DECYPHERING CODE<span className="cursor-blink"></span>
          </div>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.32em] text-primary/45">
            Verifying session
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (authError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background px-4">
        <MatrixRain className="opacity-90" />
        <div className="z-10 w-full max-w-xl rounded-[1.8rem] border border-primary/20 bg-background/70 px-6 py-6 text-center shadow-[var(--shadow-strong)] backdrop-blur-sm">
          <div className="font-display text-2xl uppercase tracking-[0.18em] text-primary glow md:text-3xl">
            ACCESS VERIFICATION FAILED
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            We could not confirm your access level right now. Retry the lookup, or sign out and back in if the problem continues.
          </div>
          <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary/55">
            {authError}
          </div>
          <div className="mt-5 flex justify-center gap-3">
            <Button onClick={() => void retryAccessLoad()}>Retry access check</Button>
            <Button variant="outline" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isApproved && !isAdmin) {
    return <ApprovalPending allowSignOut onSignOut={signOut} />;
  }

  if (requireRole && !isAdmin) {
    const allowed =
      requireRole === "staff"
        ? isStaff
        : requireRole === "asset_manager"
          ? isAssetManager
          : roles.includes(requireRole);

    if (!allowed) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
