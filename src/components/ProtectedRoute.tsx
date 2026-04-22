import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import MatrixRain from "./MatrixRain";
import { Button } from "./ui/button";
import { Terminal, ShieldAlert } from "lucide-react";

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
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-background">
        <MatrixRain />
        <div className="relative w-full max-w-md terminal-border bg-background/90 backdrop-blur-md p-8 text-center scanlines animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-6">
            <div className="size-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary box-glow">
              <ShieldAlert size={32} />
            </div>
          </div>
          
          <h1 className="font-display text-2xl text-primary glow mb-4 tracking-wider">ACCESS PENDING</h1>
          
          <div className="space-y-6">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest leading-relaxed">
              Your operative profile is currently awaiting administrator approval. 
              <br/>Contact terminal command to expedite.
            </p>
            
            <div className="py-3 px-4 bg-primary/10 border border-primary/20 rounded font-mono text-[10px] text-primary animate-pulse tracking-widest">
              // STATUS: UNRESTRICTED ACCESS DENIED //
            </div>
            
            <Button 
              onClick={() => signOut()} 
              variant="outline" 
              className="w-full border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs uppercase tracking-[0.2em] h-11"
            >
              Terminate Session
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
