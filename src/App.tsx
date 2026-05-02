import { useState } from "react";
import { LogOut, ShieldCheck, UserPlus } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

function AuthPanel() {
  const { user, roles, loading, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage(mode === "signin" ? "Signed in." : "Account created. Check email confirmation settings in Supabase.");
      setEmail("");
      setPassword("");
    }

    setSubmitting(false);
  };

  if (loading) {
    return <div className="status-panel">Loading account...</div>;
  }

  if (!isSupabaseConfigured) {
    return (
      <section className="workspace-panel" aria-labelledby="setup-heading">
        <div>
          <p className="eyebrow">Backend</p>
          <h2 id="setup-heading">Supabase needed</h2>
          <p className="form-message">Add the new project URL and publishable key to `.env` to enable users and roles.</p>
        </div>
      </section>
    );
  }

  if (user) {
    return (
      <section className="workspace-panel" aria-labelledby="account-heading">
        <div>
          <p className="eyebrow">Account</p>
          <h2 id="account-heading">{user.email}</h2>
          <div className="role-row">
            {(roles.length ? roles : ["member"]).map((role) => (
              <span className="role-pill" key={role}>
                <ShieldCheck size={14} aria-hidden="true" />
                {role}
              </span>
            ))}
          </div>
        </div>
        <button className="icon-button" type="button" onClick={signOut} aria-label="Sign out">
          <LogOut size={18} aria-hidden="true" />
        </button>
      </section>
    );
  }

  return (
    <section className="workspace-panel" aria-labelledby="auth-heading">
      <div>
        <p className="eyebrow">Access</p>
        <h2 id="auth-heading">{mode === "signin" ? "Sign in" : "Create user"}</h2>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={6}
            required
          />
        </label>
        {message ? <p className="form-message">{message}</p> : null}
        <div className="button-row">
          <button className="primary-button" type="submit" disabled={submitting}>
            <UserPlus size={16} aria-hidden="true" />
            {submitting ? "Working..." : mode === "signin" ? "Sign in" : "Create"}
          </button>
          <button className="text-button" type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Create user" : "Sign in"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Workspace() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">New Build</p>
          <h1>eCafe</h1>
        </div>
        <span className="mono-tag">v0.1</span>
      </header>

      <section className="workspace-grid">
        <div className="intro-panel">
          <p className="eyebrow">Foundation</p>
          <h2>Clean workspace</h2>
          <p>The old pages, routes, and inventory flows have been removed. This screen is the new root for the app.</p>
        </div>
        <AuthPanel />
      </section>
    </main>
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner theme="light" richColors closeButton position="top-center" />
      <AuthProvider>
        <Workspace />
      </AuthProvider>
    </TooltipProvider>
  );
}
