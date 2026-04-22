import { useState, FormEvent, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MatrixRain from "@/components/MatrixRain";
import DecypherLoader from "@/components/DecypherLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff, Terminal } from "lucide-react";

const authSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid access ID").max(255),
  password: z.string().min(1, "Required").max(100),
  displayName: z.string().trim().min(1, "Required").max(80).optional(),
});

export default function Login() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [isDecyphering, setIsDecyphering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [booting, setBooting] = useState(true);

  // Initial "boot" sequence for aesthetic
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // If already logged in, redirect unless we are in the middle of a transition
  if (!loading && session && !isDecyphering && !booting) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    try {
      const parsed = authSchema.safeParse({
        email,
        password,
        displayName: mode === "signup" ? displayName : undefined,
      });

      if (!parsed.success) {
        toast.error(parsed.error.errors[0].message);
        setBusy(false);
        return;
      }

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: email.toLowerCase(), 
          password 
        });
        if (error) throw error;
        setIsDecyphering(true);
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        
        toast.success("OPERATIVE REGISTERED");
        // Auto sign-in
        const { error: signInErr } = await supabase.auth.signInWithPassword({ 
          email: email.toLowerCase(), 
          password 
        });
        if (signInErr) throw signInErr;
        
        setIsDecyphering(true);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failure");
      setBusy(false);
    }
  };

  if (isDecyphering) {
    return (
      <DecypherLoader 
        isReady={true} 
        onComplete={() => navigate(from, { replace: true })} 
      />
    );
  }

  if (booting) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <MatrixRain />
        <Terminal className="text-primary animate-pulse size-12 mb-2" />
        <div className="font-display text-primary text-xl glow tracking-[0.2em] uppercase">
          Initializing Terminal...
        </div>
        <div className="font-mono text-primary/40 text-[10px] uppercase tracking-widest animate-flicker">
          Establishing Secure Link
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-8">
      <MatrixRain />

      <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="terminal-border rounded bg-background/80 backdrop-blur-sm p-6 sm:p-8 box-glow scanlines overflow-hidden relative">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 -rotate-45 translate-x-8 -translate-y-8 border-b border-primary/20" />
          
          <div className="mb-8 text-center relative">
            <div className="font-display text-[10px] text-primary/50 mb-3 tracking-[0.3em] uppercase">
              // Secure Terminal v1.0 //
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-primary glow mb-2 tracking-tighter">
              ENCOUNTER<span className="opacity-50 mx-1">.</span>CHURCH
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-[1px] w-8 bg-primary/30" />
              <p className="font-display text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
                Asset Management
              </p>
              <div className="h-[1px] w-8 bg-primary/30" />
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-1.5 group">
                <Label htmlFor="name" className="text-primary/70 text-[10px] uppercase tracking-widest ml-1">&gt; Operative Name</Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-primary/5 border-primary/20 text-primary placeholder:text-primary/20 focus:border-primary/60 focus:bg-primary/10 transition-all font-mono"
                  maxLength={80}
                  required
                />
              </div>
            )}
            
            <div className="space-y-1.5 group">
              <Label htmlFor="email" className="text-primary/70 text-[10px] uppercase tracking-widest ml-1">&gt; Access ID</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operative@encounter"
                className="bg-primary/5 border-primary/20 text-primary placeholder:text-primary/20 focus:border-primary/60 focus:bg-primary/10 transition-all font-mono"
                maxLength={255}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5 group">
              <Label htmlFor="password" className="text-primary/70 text-[10px] uppercase tracking-widest ml-1">&gt; Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-primary/5 border-primary/20 text-primary placeholder:text-primary/20 focus:border-primary/60 focus:bg-primary/10 transition-all font-mono pr-10"
                  maxLength={100}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-primary text-black hover:bg-primary/90 font-display tracking-[0.2em] uppercase h-11 transition-all box-glow-soft mt-2"
            >
              {busy ? "Connecting..." : mode === "signin" ? "▸ Initiate Connection" : "▸ Register Profile"}
            </Button>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="block w-full text-center text-[10px] text-muted-foreground hover:text-primary transition-colors font-mono uppercase tracking-widest pt-2"
            >
              {mode === "signin"
                ? "// No profile found? Register here"
                : "// Profile exists? Back to login"}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-primary/10 flex justify-between items-center opacity-40">
            <div className="text-[9px] font-mono uppercase tracking-tighter">status: online</div>
            <div className="text-[9px] font-mono uppercase tracking-tighter animate-pulse cursor-blink">authorized only</div>
          </div>
        </div>
      </div>
    </div>
  );
}
