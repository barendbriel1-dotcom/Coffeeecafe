import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Coffee,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRole, AuthProvider, Profile, useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import type { CoffeeType, MilkType, OrderStatus, SugarType } from "@/integrations/supabase/types";

const signupRoles: AppRole[] = ["pastor", "operator"];
const adminRoles: AppRole[] = ["admin", "pastor", "operator"];
const coffeeTypes: CoffeeType[] = ["Cappachino", "Flat White", "Cortado", "Latte"];
const milkTypes: MilkType[] = ["Fresh Milk", "Lactose Free", "Oat Milk", "Almond Milk"];
const sugarTypes: SugarType[] = ["1 Sugar", "2 Suger", "3 Suger", "Sweetner"];
const orderStatuses: OrderStatus[] = ["pending", "preparing", "ready", "completed", "cancelled"];

type View = "dashboard" | "admin" | "orders" | "profile";

interface Preference {
  id: string;
  user_id: string;
  coffee_type: CoffeeType;
  milk_type: MilkType;
  sugar_type: SugarType;
}

interface CoffeeOrder {
  id: string;
  created_by: string;
  pastor_id: string | null;
  recipient_name: string;
  coffee_type: CoffeeType;
  milk_type: MilkType;
  sugar_type: SugarType;
  notes: string | null;
  status: OrderStatus;
  created_at: string;
}

interface ManagedUser extends Profile {
  assignedRole: AppRole | null;
}

interface PastorOption {
  id: string;
  full_name: string | null;
  email: string | null;
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getDisplayName(profile: Profile | null) {
  return profile?.full_name?.trim() || "User";
}

function getRequestedRoleLabel(role: string | null | undefined) {
  if (role === "volunteer") return "Legacy Volunteer";
  return titleCase(role ?? "pastor");
}

function getPastorName(pastor: PastorOption) {
  return pastor.full_name?.trim() || pastor.email || "Pastor";
}

function SidebarNav({
  isCollapsed,
  setIsCollapsed,
  view,
  setView,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  view: View;
  setView: (view: View) => void;
}) {
  const { isAdmin, isOperator, isPastor, profile } = useAuth();

  const items: Array<{ view: View; label: string; icon: typeof LayoutDashboard }> = [
    { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  if (isPastor) {
    items.push({ view: "orders", label: "Order", icon: Coffee });
  }

  if (isAdmin || isOperator) {
    items.push({ view: "orders", label: "Orders", icon: Coffee });
  }

  if (isAdmin) {
    items.push({ view: "admin", label: "Admin", icon: Settings });
  }

  items.push({ view: "profile", label: "Profile", icon: UserRound });

  return (
    <aside className={isCollapsed ? "side-nav collapsed" : "side-nav"}>
      <div className="side-nav-header">
        <div className="side-nav-brand">
          <span className="eyebrow">eCafe</span>
          {!isCollapsed ? <strong>{getDisplayName(profile)}</strong> : null}
        </div>
        <button className="icon-button" type="button" onClick={() => setIsCollapsed(!isCollapsed)} aria-label="Toggle sidebar">
          {isCollapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
        </button>
      </div>

      <nav className="side-nav-links" aria-label="Sidebar">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              className={view === item.view ? "side-nav-link active" : "side-nav-link"}
              type="button"
              onClick={() => setView(item.view)}
            >
              <Icon size={18} aria-hidden="true" />
              {!isCollapsed ? <span>{item.label}</span> : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function CoffeeSelects({
  coffeeType,
  milkType,
  sugarType,
  onCoffeeType,
  onMilkType,
  onSugarType,
}: {
  coffeeType: CoffeeType;
  milkType: MilkType;
  sugarType: SugarType;
  onCoffeeType: (value: CoffeeType) => void;
  onMilkType: (value: MilkType) => void;
  onSugarType: (value: SugarType) => void;
}) {
  return (
    <>
      <label>
        Coffee type
        <select value={coffeeType} onChange={(event) => onCoffeeType(event.target.value as CoffeeType)}>
          {coffeeTypes.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        Milk type
        <select value={milkType} onChange={(event) => onMilkType(event.target.value as MilkType)}>
          {milkTypes.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        Sugar type
        <select value={sugarType} onChange={(event) => onSugarType(event.target.value as SugarType)}>
          {sugarTypes.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    </>
  );
}

function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [requestedRole, setRequestedRole] = useState<AppRole>("pastor");
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
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, requested_role: requestedRole } },
          });

    setMessage(
      result.error
        ? result.error.message
        : mode === "signin"
          ? "Signed in."
          : "Account created. An admin must approve your account before you can use eCafe.",
    );
    setSubmitting(false);
  };

  const resetPassword = async () => {
    if (!email) {
      setMessage("Enter your email first, then click forgot password.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    setMessage(error ? error.message : "Password reset email sent.");
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="center-shell">
        <section className="login-bubble">
          <p className="eyebrow">Backend</p>
          <h1>eCafe</h1>
          <p className="app-subtitle">Add Supabase environment variables to enable login.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="center-shell">
      <section className="login-bubble">
        <div>
          <p className="eyebrow">Welcome</p>
          <h1>eCafe</h1>
          <p className="app-subtitle">Sign in to continue to your workspace.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <>
              <label>
                Full name
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} type="text" required />
              </label>
              <label>
                Requested role
                <select value={requestedRole} onChange={(event) => setRequestedRole(event.target.value as AppRole)}>
                  {signupRoles.map((role) => (
                    <option key={role} value={role}>
                      {titleCase(role)}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}
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
              {submitting ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
            <button className="text-button" type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
            {mode === "signin" ? (
              <button className="text-button" type="button" onClick={resetPassword}>
                Forgot password
              </button>
            ) : null}
          </div>
        </form>
      </section>
    </main>
  );
}

function PendingApproval() {
  const { profile, signOut, refreshAccess } = useAuth();

  return (
    <main className="center-shell">
      <section className="login-bubble">
        <p className="eyebrow">Pending approval</p>
        <h1>Almost there</h1>
        <p className="app-subtitle">
          Your account is waiting for admin approval. Requested role: {getRequestedRoleLabel(profile?.requested_role)}.
        </p>
        <div className="button-row">
          <button className="primary-button" type="button" onClick={refreshAccess}>
            Check again
          </button>
          <button className="text-button" type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </section>
    </main>
  );
}

function NameSetup({ onSaved }: { onSaved: () => Promise<void> }) {
  const { profile, user, refreshAccess } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [message, setMessage] = useState<string | null>(null);

  const saveName = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const { error } = await supabase.from("profiles").update({ full_name: fullName.trim() }).eq("id", user.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await refreshAccess();
    await onSaved();
  };

  return (
    <main className="center-shell">
      <section className="login-bubble">
        <p className="eyebrow">Your profile</p>
        <h1>Your name</h1>
        <p className="app-subtitle">Add the name you want shown in the dashboard.</p>
        <form className="auth-form" onSubmit={saveName}>
          <label>
            Name
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} type="text" required />
          </label>
          {message ? <p className="form-message">{message}</p> : null}
          <button className="primary-button" type="submit">
            Save name
          </button>
        </form>
      </section>
    </main>
  );
}

function ProfilePage({ preference, onPreferenceSaved }: { preference: Preference | null; onPreferenceSaved: () => Promise<void> }) {
  const { isPastor, profile, user, refreshAccess } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [profileNotes, setProfileNotes] = useState(profile?.profile_notes ?? "");
  const [coffeeType, setCoffeeType] = useState<CoffeeType>(preference?.coffee_type ?? "Cappachino");
  const [milkType, setMilkType] = useState<MilkType>(preference?.milk_type ?? "Fresh Milk");
  const [sugarType, setSugarType] = useState<SugarType>(preference?.sugar_type ?? "1 Sugar");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setProfileNotes(profile?.profile_notes ?? "");
  }, [profile]);

  useEffect(() => {
    setCoffeeType(preference?.coffee_type ?? "Cappachino");
    setMilkType(preference?.milk_type ?? "Fresh Milk");
    setSugarType(preference?.sugar_type ?? "1 Sugar");
  }, [preference]);

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        profile_notes: profileNotes.trim() || null,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await refreshAccess();
    setMessage("Profile updated.");
  };

  const savePreference = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !isPastor) return;

    const { error } = await supabase.from("coffee_preferences").upsert({
      user_id: user.id,
      coffee_type: coffeeType,
      milk_type: milkType,
      sugar_type: sugarType,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    await onPreferenceSaved();
    setMessage("Coffee preference updated.");
  };

  return (
    <section className="page-panel">
      <p className="eyebrow">Profile</p>
      <h1>Your details</h1>
      <p className="app-subtitle">Update the information shown in your account.</p>
      <form className="auth-form form-panel" onSubmit={saveProfile}>
        <label>
          Name
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} type="text" required />
        </label>
        <label>
          Phone
          <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" />
        </label>
        <label>
          Notes
          <textarea value={profileNotes} onChange={(event) => setProfileNotes(event.target.value)} rows={4} />
        </label>
        {message ? <p className="form-message">{message}</p> : null}
        <button className="primary-button" type="submit">
          Save profile
        </button>
      </form>

      {isPastor ? (
        <form className="auth-form form-panel" onSubmit={savePreference}>
          <div>
            <p className="eyebrow">Preference</p>
            <h2 className="section-title">Coffee preference</h2>
          </div>
          <CoffeeSelects
            coffeeType={coffeeType}
            milkType={milkType}
            sugarType={sugarType}
            onCoffeeType={setCoffeeType}
            onMilkType={setMilkType}
            onSugarType={setSugarType}
          />
          <button className="primary-button" type="submit">
            Save preference
          </button>
        </form>
      ) : null}
    </section>
  );
}

function Dashboard({ setView }: { setView: (view: View) => void }) {
  const { isAdmin, isOperator, isPastor, roles: currentRoles } = useAuth();

  return (
    <section className="page-panel">
      <p className="eyebrow">Dashboard</p>
      <h1>eCafe</h1>
      <div className="role-row">
        {currentRoles.map((role) => (
          <span className="role-pill" key={role}>
            <ShieldCheck size={14} aria-hidden="true" />
            {titleCase(role)}
          </span>
        ))}
      </div>
      <div className="dashboard-actions">
        {isPastor ? (
          <button className="action-card" type="button" onClick={() => setView("orders")}>
            <Coffee aria-hidden="true" />
            <span>Order</span>
          </button>
        ) : null}
        {isAdmin || isOperator ? (
          <button className="action-card" type="button" onClick={() => setView("orders")}>
            <Coffee aria-hidden="true" />
            <span>Orders</span>
          </button>
        ) : null}
        {isAdmin ? (
          <button className="action-card" type="button" onClick={() => setView("admin")}>
            <Settings aria-hidden="true" />
            <span>Admin</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}

function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roleSelections, setRoleSelections] = useState<Record<string, AppRole>>({});
  const [message, setMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    const [{ data: profilesData, error: profilesError }, { data: rolesData, error: rolesError }] = await Promise.all([
      supabase.from("profiles").select("id,email,full_name,approved,requested_role").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
    ]);

    if (profilesError) {
      setMessage(profilesError.message);
      return;
    }

    if (rolesError) {
      setMessage(rolesError.message);
      return;
    }

    const rolesByUserId = new Map(
      (rolesData ?? [])
        .filter((row) => ["admin", "pastor", "operator"].includes(row.role))
        .map((row) => [row.user_id, row.role as AppRole]),
    );

    const nextUsers = ((profilesData ?? []) as Profile[]).map((profile) => ({
      ...profile,
      assignedRole: rolesByUserId.get(profile.id) ?? null,
    }));

    setUsers(nextUsers);
    setRoleSelections(
      Object.fromEntries(
        nextUsers.map((managedUser) => [
          managedUser.id,
          managedUser.assignedRole ?? (managedUser.requested_role === "operator" ? "operator" : "pastor"),
        ]),
      ),
    );
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const updateUser = async (managedUser: ManagedUser, approved: boolean) => {
    const selectedRole = roleSelections[managedUser.id] ?? "pastor";

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        approved,
        requested_role: selectedRole,
        approved_at: approved ? new Date().toISOString() : null,
        approved_by: approved ? user?.id : null,
      })
      .eq("id", managedUser.id);

    if (profileError) {
      setMessage(profileError.message);
      return;
    }

    const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", managedUser.id);
    if (deleteError) {
      setMessage(deleteError.message);
      return;
    }

    if (approved) {
      const { error: roleError } = await supabase.from("user_roles").insert({ user_id: managedUser.id, role: selectedRole });
      if (roleError) {
        setMessage(roleError.message);
        return;
      }
    }

    setMessage("User updated.");
    await loadUsers();
  };

  return (
    <section className="page-panel">
      <p className="eyebrow">Admin</p>
      <h1>Users</h1>
      <p className="app-subtitle">Approve accounts and assign active roles.</p>
      {message ? <p className="form-message">{message}</p> : null}
      <div className="list-stack">
        {users.map((managedUser) => {
          const selectedRole = roleSelections[managedUser.id] ?? "pastor";
          return (
            <article className="list-item" key={managedUser.id}>
              <div>
                <strong>{managedUser.full_name || managedUser.email}</strong>
                <p>{managedUser.email}</p>
                <p>Requested: {getRequestedRoleLabel(managedUser.requested_role)}</p>
              </div>
              <div className="admin-controls">
                <select
                  value={selectedRole}
                  onChange={(event) =>
                    setRoleSelections((current) => ({
                      ...current,
                      [managedUser.id]: event.target.value as AppRole,
                    }))
                  }
                >
                  {adminRoles.map((role) => (
                    <option key={role} value={role}>
                      {titleCase(role)}
                    </option>
                  ))}
                </select>
                <button
                  className={managedUser.approved ? "text-button" : "primary-button"}
                  type="button"
                  onClick={() => updateUser(managedUser, !managedUser.approved)}
                >
                  {managedUser.approved ? "Unapprove" : "Approve"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function OrdersPage({ preference, reloadPreference }: { preference: Preference | null; reloadPreference: () => Promise<void> }) {
  const { isAdmin, isOperator, isPastor, user, profile } = useAuth();
  const [orders, setOrders] = useState<CoffeeOrder[]>([]);
  const [pastors, setPastors] = useState<PastorOption[]>([]);
  const [selectedPastorId, setSelectedPastorId] = useState("");
  const [recipientName, setRecipientName] = useState(profile?.full_name || profile?.email || "");
  const [coffeeType, setCoffeeType] = useState<CoffeeType>(preference?.coffee_type ?? "Cappachino");
  const [milkType, setMilkType] = useState<MilkType>(preference?.milk_type ?? "Fresh Milk");
  const [sugarType, setSugarType] = useState<SugarType>(preference?.sugar_type ?? "1 Sugar");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const canSeeQueue = isAdmin || isOperator;

  const loadOrders = useCallback(async () => {
    const { data, error } = await supabase.from("coffee_orders").select("*").order("created_at", { ascending: false });
    if (error) {
      setMessage(error.message);
      return;
    }
    setOrders((data ?? []) as CoffeeOrder[]);
  }, []);

  const loadPastors = useCallback(async () => {
    if (!isOperator) {
      setPastors([]);
      return;
    }

    const [{ data: profilesData, error: profilesError }, { data: rolesData, error: rolesError }] = await Promise.all([
      supabase.from("profiles").select("id,full_name,email,approved").eq("approved", true),
      supabase.from("user_roles").select("user_id,role").eq("role", "pastor"),
    ]);

    if (profilesError) {
      setMessage(profilesError.message);
      return;
    }

    if (rolesError) {
      setMessage(rolesError.message);
      return;
    }

    const pastorIds = new Set((rolesData ?? []).map((row) => row.user_id));
    const nextPastors = ((profilesData ?? []) as Array<PastorOption & { approved?: boolean }>).filter((entry) => pastorIds.has(entry.id));
    setPastors(nextPastors);
    if (!selectedPastorId && nextPastors[0]) {
      setSelectedPastorId(nextPastors[0].id);
    }
  }, [isOperator, selectedPastorId]);

  useEffect(() => {
    if (canSeeQueue) void loadOrders();
  }, [canSeeQueue, loadOrders]);

  useEffect(() => {
    void loadPastors();
  }, [loadPastors]);

  useEffect(() => {
    if (preference) {
      setCoffeeType(preference.coffee_type);
      setMilkType(preference.milk_type);
      setSugarType(preference.sugar_type);
    }
  }, [preference]);

  useEffect(() => {
    if (isPastor) {
      setRecipientName(profile?.full_name || profile?.email || "");
    }
  }, [isPastor, profile?.email, profile?.full_name]);

  const createPastorOrder = async (event?: React.FormEvent<HTMLFormElement>, usePreference = false) => {
    event?.preventDefault();
    if (!user || !isPastor) return;

    const source = usePreference && preference ? preference : { coffee_type: coffeeType, milk_type: milkType, sugar_type: sugarType };
    const { error } = await supabase.from("coffee_orders").insert({
      created_by: user.id,
      pastor_id: user.id,
      recipient_name: profile?.full_name || profile?.email || "Pastor",
      coffee_type: source.coffee_type,
      milk_type: source.milk_type,
      sugar_type: source.sugar_type,
      notes: notes || null,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Order submitted.");
    setNotes("");
    await loadOrders();
  };

  const createOperatorOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !isOperator) return;

    const targetPastor = pastors.find((pastor) => pastor.id === selectedPastorId);
    if (!targetPastor) {
      setMessage("Choose a pastor first.");
      return;
    }

    const { error } = await supabase.from("coffee_orders").insert({
      created_by: user.id,
      pastor_id: targetPastor.id,
      recipient_name: getPastorName(targetPastor),
      coffee_type: coffeeType,
      milk_type: milkType,
      sugar_type: sugarType,
      notes: notes || null,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Order submitted for pastor.");
    setNotes("");
    await loadOrders();
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from("coffee_orders").update({ status }).eq("id", orderId);
    if (error) {
      setMessage(error.message);
      return;
    }
    await loadOrders();
  };

  const updateOrderDetails = async (order: CoffeeOrder, values: Partial<CoffeeOrder>) => {
    const payload = {
      pastor_id: values.pastor_id ?? order.pastor_id,
      recipient_name: values.recipient_name ?? order.recipient_name,
      coffee_type: values.coffee_type ?? order.coffee_type,
      milk_type: values.milk_type ?? order.milk_type,
      sugar_type: values.sugar_type ?? order.sugar_type,
      notes: values.notes ?? order.notes,
    };

    const { error } = await supabase.from("coffee_orders").update(payload).eq("id", order.id);
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Order updated.");
    await loadOrders();
  };

  const preferenceLabel = useMemo(() => {
    if (!preference) return "No preference saved";
    return `${preference.coffee_type}, ${preference.milk_type}, ${preference.sugar_type}`;
  }, [preference]);

  return (
    <section className="page-panel">
      <p className="eyebrow">Orders</p>
      <h1>{isPastor ? "Order coffee" : "Orders placed"}</h1>
      {message ? <p className="form-message">{message}</p> : null}

      {isPastor ? (
        <>
          <div className="preference-strip">
            <div>
              <strong>Preference coffee</strong>
              <p>{preferenceLabel}</p>
            </div>
            <div className="button-row">
              <button className="primary-button" type="button" disabled={!preference} onClick={() => createPastorOrder(undefined, true)}>
                Submit preference
              </button>
              <button className="text-button" type="button" onClick={reloadPreference}>
                Refresh
              </button>
            </div>
          </div>

          <form className="auth-form form-panel" onSubmit={(event) => createPastorOrder(event)}>
            <label>
              Name on order
              <input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} required />
            </label>
            <CoffeeSelects
              coffeeType={coffeeType}
              milkType={milkType}
              sugarType={sugarType}
              onCoffeeType={setCoffeeType}
              onMilkType={setMilkType}
              onSugarType={setSugarType}
            />
            <label>
              Notes
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
            </label>
            <button className="primary-button" type="submit">
              Submit order
            </button>
          </form>
        </>
      ) : null}

      {isOperator ? (
        <form className="auth-form form-panel" onSubmit={createOperatorOrder}>
          <div>
            <p className="eyebrow">Pastoral order</p>
            <h2 className="section-title">Create for a pastor</h2>
          </div>
          <label>
            Pastor
            <select value={selectedPastorId} onChange={(event) => setSelectedPastorId(event.target.value)} required>
              <option value="" disabled>
                Select pastor
              </option>
              {pastors.map((pastor) => (
                <option key={pastor.id} value={pastor.id}>
                  {getPastorName(pastor)}
                </option>
              ))}
            </select>
          </label>
          <CoffeeSelects
            coffeeType={coffeeType}
            milkType={milkType}
            sugarType={sugarType}
            onCoffeeType={setCoffeeType}
            onMilkType={setMilkType}
            onSugarType={setSugarType}
          />
          <label>
            Notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          </label>
          <button className="primary-button" type="submit">
            Submit for pastor
          </button>
        </form>
      ) : null}

      {canSeeQueue ? (
        <div className="list-stack">
          {orders.map((order) => (
            <article className="list-item" key={order.id}>
              <div className="order-item-details">
                <strong>{order.recipient_name}</strong>
                {isAdmin ? (
                  <div className="auth-form compact-form">
                    <CoffeeSelects
                      coffeeType={order.coffee_type}
                      milkType={order.milk_type}
                      sugarType={order.sugar_type}
                      onCoffeeType={(value) => void updateOrderDetails(order, { coffee_type: value })}
                      onMilkType={(value) => void updateOrderDetails(order, { milk_type: value })}
                      onSugarType={(value) => void updateOrderDetails(order, { sugar_type: value })}
                    />
                    <label>
                      Name on order
                      <input
                        value={order.recipient_name}
                        onChange={(event) =>
                          setOrders((current) =>
                            current.map((entry) =>
                              entry.id === order.id ? { ...entry, recipient_name: event.target.value } : entry,
                            ),
                          )
                        }
                        onBlur={(event) => void updateOrderDetails(order, { recipient_name: event.target.value })}
                      />
                    </label>
                    <label>
                      Notes
                      <textarea
                        value={order.notes ?? ""}
                        rows={2}
                        onChange={(event) =>
                          setOrders((current) =>
                            current.map((entry) => (entry.id === order.id ? { ...entry, notes: event.target.value } : entry)),
                          )
                        }
                        onBlur={(event) => void updateOrderDetails(order, { notes: event.target.value || null })}
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <p>
                      {order.coffee_type}, {order.milk_type}, {order.sugar_type}
                    </p>
                    {order.notes ? <p>{order.notes}</p> : null}
                  </>
                )}
              </div>
              <div className="admin-controls">
                <span className="role-pill">{titleCase(order.status)}</span>
                {isOperator ? (
                  <select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value as OrderStatus)}>
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {titleCase(status)}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function AppShell() {
  const auth = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [preference, setPreference] = useState<Preference | null>(null);
  const [preferenceLoading, setPreferenceLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const loadPreference = useCallback(async () => {
    if (!auth.user || !auth.isPastor) {
      setPreference(null);
      return;
    }

    setPreferenceLoading(true);
    const { data } = await supabase.from("coffee_preferences").select("*").eq("user_id", auth.user.id).maybeSingle();
    setPreference((data as Preference | null) ?? null);
    setPreferenceLoading(false);
  }, [auth.isPastor, auth.user]);

  useEffect(() => {
    if (auth.isApproved) void loadPreference();
  }, [auth.isApproved, auth.user?.id, loadPreference]);

  if (auth.loading) {
    return (
      <main className="center-shell">
        <section className="login-bubble">
          <p className="form-message">Loading...</p>
        </section>
      </main>
    );
  }

  if (!auth.user) return <AuthScreen />;
  if (!auth.isApproved) return <PendingApproval />;
  if (!auth.profile?.full_name?.trim()) return <NameSetup onSaved={loadPreference} />;
  if (preferenceLoading) {
    return (
      <main className="center-shell">
        <section className="login-bubble">
          <p className="form-message">Loading preference...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="workspace-shell">
      <div className="container" aria-hidden="true" />
      <SidebarNav isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} view={view} setView={setView} />

      <section className="workspace-main">
        <header className="top-bar">
          <button className="brand-button" type="button" onClick={() => setView("dashboard")}>
            eCafe
          </button>
          <div className="user-menu">
            <button className="icon-text-button" type="button" onClick={() => setMenuOpen((open) => !open)}>
              <UserRound size={18} aria-hidden="true" />
              {getDisplayName(auth.profile)}
            </button>
            {menuOpen ? (
              <div className="menu-popover">
                <button type="button" onClick={() => setView("dashboard")}>
                  Dashboard
                </button>
                <button type="button" onClick={() => setView("profile")}>
                  Profile
                </button>
                {auth.isAdmin ? (
                  <button type="button" onClick={() => setView("admin")}>
                    Admin
                  </button>
                ) : null}
                {(auth.isAdmin || auth.isOperator || auth.isPastor) ? (
                  <button type="button" onClick={() => setView("orders")}>
                    Orders
                  </button>
                ) : null}
                <button type="button" onClick={auth.signOut}>
                  <LogOut size={14} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </header>

        {view === "dashboard" ? <Dashboard setView={setView} /> : null}
        {view === "admin" && auth.isAdmin ? <AdminPage /> : null}
        {view === "orders" ? <OrdersPage preference={preference} reloadPreference={loadPreference} /> : null}
        {view === "profile" ? <ProfilePage preference={preference} onPreferenceSaved={loadPreference} /> : null}
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
        <AppShell />
      </AuthProvider>
    </TooltipProvider>
  );
}
