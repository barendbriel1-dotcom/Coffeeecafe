import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "owner" | "admin" | "member";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = async (userId: string) => {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);

    if (error) throw error;

    const nextRoles = (data ?? []).map((row) => row.role as AppRole);
    setRoles(nextRoles.length ? nextRoles : ["member"]);
  };

  const refreshRoles = async () => {
    if (!session?.user) return;
    await loadRoles(session.user.id);
  };

  useEffect(() => {
    const syncSession = async (nextSession: Session | null) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        await loadRoles(nextSession.user.id);
      } catch {
        setRoles(["member"]);
      } finally {
        setLoading(false);
      }
    };

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      void syncSession(nextSession);
    });

    supabase.auth.getSession().then(({ data }) => syncSession(data.session));

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        roles,
        loading,
        isOwner: roles.includes("owner"),
        isAdmin: roles.includes("admin") || roles.includes("owner"),
        signOut,
        refreshRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
