import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import MatrixRain from "./MatrixRain";
import ApprovalPending from "./ApprovalPending";

export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: AppRole;
}) {
  const { session, loading, roles, isAdmin, isApproved, signOut } = useAuth();
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

  if (!isApproved && !isAdmin) {
    return <ApprovalPending allowSignOut onSignOut={signOut} />;
  }

  if (requireRole && !isAdmin && !roles.includes(requireRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
