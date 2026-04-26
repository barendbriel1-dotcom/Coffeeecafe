import { FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, TerminalSquare } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import DecypherLoader from "@/components/DecypherLoader";
import DecypherText from "@/components/DecypherText";
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
  const { session, loading, isApproved, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";
  const isResetRecovery = new URLSearchParams(location.search).get("reset") === "true";
  const appUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, "");

  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "reset">(isResetRecovery ? "reset" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [isDecyphering, setIsDecyphering] = useState(false);
  const [decypherTarget, setDecypherTarget] = useState(from);
  const [showPassword, setShowPassword] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isResetRecovery) {
      setMode("reset");
    }
  }, [isResetRecovery]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!loading && session && !isDecyphering && !booting && mode !== "reset") {
    return <Navigate to={isApproved || isAdmin ? from : "/approval-pending"} replace />;
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

      if (mode !== "forgot" && mode !== "reset" && !parsed.success) {
        toast.error(parsed.error.errors[0].message);
        setBusy(false);
        return;
      }

      if (mode === "forgot") {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
          toast.error("Enter your email address");
          setBusy(false);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${appUrl}/login?reset=true`,
        });
        if (error) throw error;

        toast.success("Password reset email sent.");
        setMode("signin");
      } else if (mode === "reset") {
        if (!password) {
          toast.error("Enter your new password");
          setBusy(false);
          return;
        }

        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setBusy(false);
          return;
        }

        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;

        toast.success("Password updated. Please sign in.");
        await supabase.auth.signOut();
        setPassword("");
        setConfirmPassword("");
        setMode("signin");
        navigate("/login", { replace: true });
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.toLowerCase(), password });
        if (error) throw error;
        setDecypherTarget(from);
        setIsDecyphering(true);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${appUrl}/`,
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

        setDecypherTarget("/approval-pending");
        setIsDecyphering(true);
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Authentication failed");
      setBusy(false);
    }
  };

  if (isDecyphering) {
    return <DecypherLoader isReady={true} onComplete={() => navigate(decypherTarget, { replace: true })} />;
  }

  if (booting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background">
        <MatrixRain className="opacity-95" />
        <div className="z-10 rounded-[1.8rem] border border-primary/20 bg-background/58 px-6 py-5 text-center shadow-[var(--shadow-strong)] backdrop-blur-sm">
          <div className="font-display text-2xl text-primary glow tracking-[0.24em] uppercase md:text-4xl">
            <DecypherText />
          </div>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.32em] text-primary/45">
            Initializing access shell
          </div>
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
            <div className="app-kicker">
              {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create access" : mode === "forgot" ? "Recover access" : "Reset password"}
            </div>
            <h2 className="mt-2 font-display text-3xl text-foreground glow-soft">
              {mode === "signin" ? "Login" : mode === "signup" ? "Request a new account" : mode === "forgot" ? "Forgot Password" : "Choose a new password"}
            </h2>
            {mode === "signup" && (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                New accounts are created here and then approved by an administrator before full access is granted.
              </p>
            )}
            {mode === "forgot" && (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Enter your email address and we will send you a verification link to reset your password.
              </p>
            )}
            {mode === "reset" && (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Set a new password for your operator account.
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Display name</Label>
                <Input id="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="John Doe" maxLength={80} required />
              </div>
            )}

            {mode !== "reset" && (
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
            )}

            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">
                  {mode === "reset" ? "New password" : "Password"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={mode === "reset" ? "Enter your new password" : "Enter your password"}
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
            )}

            {mode === "reset" && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">
                  Confirm password
                </Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your new password"
                  maxLength={100}
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            <Button type="submit" disabled={busy} className="mt-3 w-full">
              <TerminalSquare size={16} />
              {busy
                ? "Working..."
                : mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : mode === "forgot"
                      ? "Send reset email"
                      : "Update password"}
            </Button>

            {mode === "signin" && (
              <>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="block w-full text-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Create Operator Access
                </button>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="block w-full text-center text-sm font-medium text-primary/82 transition-colors hover:text-primary"
                >
                  Forgot Password
                </button>
              </>
            )}

            {mode === "signup" && (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="block w-full text-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Login Oporator Access
              </button>
            )}

            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="block w-full text-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Login Oporator Access
              </button>
            )}

            {mode === "reset" && (
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  navigate("/login", { replace: true });
                }}
                className="block w-full text-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Back to Login
              </button>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
