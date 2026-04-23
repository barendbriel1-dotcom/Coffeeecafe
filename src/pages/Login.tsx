import { FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, TerminalSquare } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import DecypherLoader from "@/components/DecypherLoader";
import MatrixRain from "@/components/MatrixRain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const authSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
  password: z.string().min(1, "Password is required").max(100),
  displayName: z.string().trim().min(1, "Display name is required").max(80).optional(),
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

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(timer);
  }, []);

  if (!loading && session && !isDecyphering && !booting) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
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
        const { error } = await supabase.auth.signInWithPassword({ email: email.toLowerCase(), password });
        if (error) throw error;
        setIsDecyphering(true);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;

        toast.success("Profile created. Waiting for approval.");

        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password,
          });

          if (signInError) {
            navigate("/approval-pending", { replace: true });
            return;
          }
        }

        setIsDecyphering(true);
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Authentication failed");
      setBusy(false);
    }
  };

  if (isDecyphering) {
    return <DecypherLoader isReady={true} onComplete={() => navigate(from, { replace: true })} />;
  }

  if (booting) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background p-6">
        <div className="app-panel-strong w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-[1.6rem] border border-primary/20 bg-primary/10 text-primary">
            <ShieldCheck className="size-8" />
          </div>
          <div className="app-kicker">Preparing workspace</div>
          <div className="mt-2 font-display text-3xl text-foreground glow-soft">Loading Assets Hub</div>
          <div className="mt-3 font-mono text-sm text-muted-foreground">Starting a cleaner Matrix workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <MatrixRain interactive className="opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_24%)]" />

      <div className="relative w-full max-w-xl">
        <section className="scanlines relative overflow-hidden rounded-[2rem] border border-primary/20 bg-background p-6 shadow-[var(--shadow-strong)] sm:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-primary/24" />
          <div className="mb-8">
            <div className="app-kicker">{mode === "signin" ? "Welcome back" : "Create access"}</div>
            <h2 className="mt-2 font-display text-3xl text-foreground glow-soft">
              {mode === "signin" ? "Sign in to your workspace" : "Request a new account"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {mode === "signin"
                ? "Use your approved account to continue into the asset management dashboard."
                : "New accounts are created here and then approved by an administrator before full access is granted."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Display name</Label>
                <Input id="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="John Doe" maxLength={80} required />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                maxLength={255}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  maxLength={100}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className="pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={busy} className="mt-3 w-full">
              <TerminalSquare size={16} />
              {busy ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
            </Button>

            <button
              type="button"
              onClick={() => setMode((value) => (value === "signin" ? "signup" : "signin"))}
              className="block w-full text-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              {mode === "signin" ? "Create Oporator Access" : "Login Oporator Access"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
