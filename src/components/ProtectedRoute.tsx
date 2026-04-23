import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import MatrixRain from "./MatrixRain";
import ApprovalPending from "./ApprovalPending";
import { Terminal } from "lucide-react";

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
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
        <MatrixRain />
        <div className="z-10 flex flex-col items-center gap-4">
          <Terminal className="text-primary animate-pulse size-10" />
          <div className="font-display text-primary text-xl glow tracking-[0.2em] uppercase">
            Decrypting Session<span className="cursor-blink"></span>
          </div>
          <div className="font-mono text-[10px] text-primary/40 uppercase tracking-[0.3em]">
            Verifying Credentials
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
