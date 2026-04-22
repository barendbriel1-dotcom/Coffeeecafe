import { ReactNode, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import MatrixRain from "./MatrixRain";
import { Button } from "./ui/button";
import DecypherLoader from "./DecypherLoader";

export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: AppRole;
}) {
  const { session, loading, roles, isAdmin, isApproved, signOut } = useAuth();
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(true);

  if (loading || showLoader) {
    return (
      <DecypherLoader 
        isReady={!loading} 
        onComplete={() => setShowLoader(false)} 
      />
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isApproved && !isAdmin) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <MatrixRain />
        <div className="relative w-full max-w-md terminal-border bg-background/80 backdrop-blur-sm p-8 text-center scanlines">
          <h1 className="font-display text-2xl text-primary glow mb-4">ACCESS PENDING</h1>
          <p className="font-mono text-sm text-muted-foreground mb-6 uppercase tracking-wider">
            Your operative profile is currently awaiting administrator approval.
          </p>
          <div className="space-y-4">
            <div className="py-3 px-4 bg-primary/10 border border-primary/30 rounded font-mono text-xs text-primary animate-pulse">
              // STATUS: AWAITING AUTHORIZATION
            </div>
            <Button 
              onClick={() => signOut()} 
              variant="outline" 
              className="w-full border-primary/40 text-primary hover:bg-primary/10 font-mono text-xs uppercase tracking-widest"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (requireRole && !isAdmin && !roles.includes(requireRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
