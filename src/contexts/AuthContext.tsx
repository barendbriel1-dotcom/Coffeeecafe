import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "staff" | "volunteer" | "asset_manager";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  authError: string | null;
  isAdmin: boolean;
  isStaff: boolean;
  isVolunteer: boolean;
  isAssetManager: boolean;
  assetManagerLocationId: string | null;
  isApproved: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  retryAccessLoad: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [assetManagerLocationId, setAssetManagerLocationId] = useState<string | null>(null);

  const loadRoles = async (userId: string) => {
    const [{ data: rolesData, error: rolesError }, { data: profileData, error: profileError }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("asset_manager_location_id").eq("id", userId).maybeSingle(),
    ]);

    if (rolesError) throw rolesError;
    if (profileError) throw profileError;

    const nextRoles = (rolesData ?? []).map((row) => row.role as AppRole);
    setRoles(nextRoles);
    setAssetManagerLocationId(profileData?.asset_manager_location_id ?? null);
    setAuthError(null);
    return nextRoles;
  };

  const retryAccessLoad = async () => {
    if (!session?.user) return;

    setLoading(true);
    setAuthError(null);

    try {
      await loadRoles(session.user.id);
    } catch (error: any) {
      setRoles([]);
      setAssetManagerLocationId(null);
      setAuthError(error?.message ?? "We could not verify your access right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setLoading(true);
        setRoles([]);
        setAuthError(null);
        // Defer DB call to avoid deadlock
        setTimeout(() => {
          loadRoles(newSession.user.id)
            .catch((error: any) => {
              setRoles([]);
              setAssetManagerLocationId(null);
              setAuthError(error?.message ?? "We could not verify your access right now.");
            })
            .finally(() => setLoading(false));
        }, 0);
      } else {
        setRoles([]);
        setAssetManagerLocationId(null);
        setAuthError(null);
        setLoading(false);
      }
    });

    // THEN check existing
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
        setRoles([]);
        setAuthError(null);
        loadRoles(existing.user.id)
          .catch((error: any) => {
            setRoles([]);
            setAssetManagerLocationId(null);
            setAuthError(error?.message ?? "We could not verify your access right now.");
          })
          .finally(() => setLoading(false));
      } else {
        setAssetManagerLocationId(null);
        setAuthError(null);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRoles([]);
    setAssetManagerLocationId(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        roles,
        authError,
        isAdmin: roles.includes("admin"),
        isStaff: roles.includes("staff") || roles.includes("admin") || roles.includes("asset_manager"),
        isVolunteer: roles.includes("volunteer") && !roles.includes("admin") && !roles.includes("staff") && !roles.includes("asset_manager"),
        isAssetManager: roles.includes("asset_manager"),
        assetManagerLocationId,
        isApproved: roles.length > 0,
        loading,
        signOut,
        retryAccessLoad,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
