import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";

export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: AppRole;
}) {
  const { session, loading, roles, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-display text-primary">
        <span className="cursor-blink glow">DECRYPTING SESSION</span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && !isAdmin && !roles.includes(requireRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
