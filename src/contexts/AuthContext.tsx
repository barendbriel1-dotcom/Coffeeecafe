import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "pastor" | "operator" | "cafe";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  profile_notes: string | null;
  approved: boolean;
  requested_role: AppRole;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  isApproved: boolean;
  isAdmin: boolean;
  isPastor: boolean;
  isOperator: boolean;
  isCafe: boolean;
  signOut: () => Promise<void>;
  refreshAccess: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccess = async (userId: string) => {
    const [{ data: profileData, error: profileError }, { data: roleData, error: roleError }] = await Promise.all([
      supabase.from("profiles").select("id,email,full_name,phone,profile_notes,approved,requested_role").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    if (profileError) throw profileError;
    if (roleError) throw roleError;

    const nextRoles = (roleData ?? [])
      .map((row) => row.role as AppRole)
      .filter((role): role is AppRole => ["admin", "pastor", "operator", "cafe"].includes(role));

    setProfile((profileData as Profile | null) ?? null);
    setRoles(nextRoles);
  };

  const refreshAccess = async () => {
    if (!session?.user) return;
    await loadAccess(session.user.id);
  };

  useEffect(() => {
    const syncSession = async (nextSession: Session | null) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        await loadAccess(nextSession.user.id);
      } catch {
        setProfile(null);
        setRoles([]);
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
    setProfile(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        roles,
        loading,
        isApproved: Boolean(profile?.approved),
        isAdmin: roles.includes("admin"),
        isPastor: roles.includes("pastor"),
        isOperator: roles.includes("operator"),
        isCafe: roles.includes("cafe"),
        signOut,
        refreshAccess,
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
