import { useState, FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MatrixRain from "@/components/MatrixRain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

  if (!loading && session) return <Navigate to={from} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const parsed = authSchema.safeParse({
        email,
        password,
        displayName: mode === "signup" ? displayName : undefined,
      });
      if (!parsed.success) {
        toast.error(parsed.error.errors[0].message);
        return;
      }

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.toLowerCase(), password });
        if (error) throw error;
        toast.success("ACCESS GRANTED");
        navigate(from, { replace: true });
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
        toast.success("OPERATIVE REGISTERED — signing in…");
        // try sign-in immediately (auto-confirm is enabled)
        await supabase.auth.signInWithPassword({ email: email.toLowerCase(), password });
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failure");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-8">
      <MatrixRain />

      <div className="relative w-full max-w-md">
        <div className="terminal-border rounded bg-background/80 backdrop-blur-sm p-6 sm:p-8 box-glow scanlines">
          <div className="mb-6 text-center">
            <div className="font-display text-xs text-primary/70 mb-2 animate-flicker">
              [ SECURE TERMINAL // v1.0 ]
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-primary glow">
              ENCOUNTER.CHURCH
            </h1>
            <p className="font-display text-xs text-muted-foreground mt-1">
              ASSET MANAGEMENT SYSTEM
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1">
                <Label htmlFor="name" className="text-primary text-xs uppercase">&gt; Operative Name</Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Neo"
                  className="bg-background/50 hover:bg-muted focus:bg-muted border-primary/40 text-primary placeholder:text-muted-foreground/50 focus:border-primary focus-visible:ring-primary/40 font-mono"
                  maxLength={80}
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-primary text-xs uppercase">&gt; Access ID</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@encounter.church"
                className="bg-background/50 hover:bg-muted focus:bg-muted border-primary/40 text-primary placeholder:text-muted-foreground/50 focus:border-primary focus-visible:ring-primary/40 font-mono"
                maxLength={255}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-primary text-xs uppercase">&gt; Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background/50 hover:bg-muted focus:bg-muted border-primary/40 text-primary placeholder:text-muted-foreground/50 focus:border-primary focus-visible:ring-primary/40 font-mono pr-10"
                  maxLength={100}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider box-glow-soft uppercase"
            >
              {busy ? "Connecting…" : mode === "signin" ? "▸ Initiate Connection" : "▸ Register Operative"}
            </Button>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="block w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === "signin"
                ? "// create access id"
                : "// already enrolled? — log in"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-primary/20 text-[10px] text-muted-foreground/60 font-mono text-center cursor-blink">
            wake up
          </div>
        </div>
      </div>
    </div>
  );
}
