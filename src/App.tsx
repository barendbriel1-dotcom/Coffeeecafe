import { useCallback, useEffect, useMemo, useState } from "react";
import { Coffee, LayoutDashboard, PanelLeftClose, PanelLeftOpen, ShieldCheck, UserRound } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRole, AuthProvider, Profile, useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import type {
  CoffeeType,
  HeatLevel,
  Json,
  MilkType,
  OrderFieldKey,
  OrderFormType,
  OrderStatus,
  OrderType,
  SugarType,
} from "@/integrations/supabase/types";

const signupRoles: AppRole[] = ["pastor", "operator"];
const adminRoles: AppRole[] = ["admin", "pastor", "operator", "cafe"];
const defaultCoffeeTypes: CoffeeType[] = ["Cappachino", "Flat White", "Cortado", "Latte"];
const defaultMilkTypes: MilkType[] = ["Fresh Milk", "Lactose Free", "Oat Milk", "Almond Milk"];
const defaultSugarTypes: SugarType[] = ["1 Sugar", "2 Suger", "3 Suger", "Sweetner"];
const defaultHeatLevels: HeatLevel[] = [
  "55 degrees",
  "56 degrees",
  "57 degrees",
  "58 degrees",
  "59 degrees",
  "60 degrees",
  "61 degrees",
  "62 degrees",
  "63 degrees",
  "64 degrees",
  "65 degrees",
  "66 degrees",
  "67 degrees",
  "68 degrees",
  "69 degrees",
  "70 degrees",
];
const orderStatuses: OrderStatus[] = ["pending", "preparing", "ready", "completed", "cancelled"];
const defaultPreacherExtraLabels = ["Water", "Juice", "Tea", "Extra coffee", "Snacks", "Napkins"] as const;
const builderFieldLabels: Record<OrderFieldKey, string> = {
  coffee_type: "Coffee type",
  milk_type: "Milk type",
  sugar_type: "Sugar type",
  milk_heat: "Milk heat",
  extra_item: "Extra item",
};

type View = "dashboard" | "account" | "orders" | "cafe" | "profile";
type AdminAccountSection = "profile" | "users" | "builder";
type OperatorOrderMode = "normal" | "preacher";
type PreacherTargetMode = "pastor" | "guest";

interface Preference {
  id: string;
  user_id: string;
  coffee_type: CoffeeType;
  milk_type: MilkType;
  sugar_type: SugarType;
  milk_heat: HeatLevel;
}

interface PreacherExtraValue {
  quantity: number;
  note: string;
}

type PreacherExtras = Record<string, PreacherExtraValue>;

interface CoffeeOrder {
  id: string;
  created_by: string;
  pastor_id: string | null;
  order_type: OrderType;
  recipient_name: string;
  guest_name: string | null;
  guest_details: string | null;
  custom_extra_items: string | null;
  preacher_extras: Json | null;
  coffee_type: CoffeeType;
  milk_type: MilkType;
  sugar_type: SugarType;
  milk_heat: HeatLevel;
  notes: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
}

interface OrderDetailPanelProps {
  order: CoffeeOrder;
  isAdmin: boolean;
  canChangeStatus: boolean;
  pastors: PastorOption[];
  formConfig: OrderFormConfig;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
  onOrderChange: (order: CoffeeOrder, values: Partial<CoffeeOrder>) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
}

interface ManagedUser extends Profile {
  assignedRole: AppRole | null;
}

interface PastorOption {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface OrderFormOption {
  id: string;
  form_type: OrderFormType;
  field_key: OrderFieldKey;
  label: string;
  sort_order: number;
  active: boolean;
}

interface OrderFormConfig {
  coffeeOptions: CoffeeType[];
  milkOptions: MilkType[];
  sugarOptions: SugarType[];
  heatOptions: HeatLevel[];
  preacherExtraOptions: string[];
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

function createEmptyPreacherExtras(labels: string[]): PreacherExtras {
  return Object.fromEntries(labels.map((label) => [label, { quantity: 0, note: "" }]));
}

function normalizePreacherExtras(value: Json | null | undefined, labels: string[]): PreacherExtras {
  const base = createEmptyPreacherExtras(labels);
  if (!value || typeof value !== "object" || Array.isArray(value)) return base;

  for (const key of labels) {
    const raw = value[key];
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const quantity = typeof raw.quantity === "number" ? raw.quantity : Number(raw.quantity ?? 0);
      const note = typeof raw.note === "string" ? raw.note : "";
      base[key] = { quantity: Number.isFinite(quantity) ? quantity : 0, note };
    }
  }

  return base;
}

function extrasToJson(extras: PreacherExtras): Json {
  const payload: Record<string, Json> = {};
  for (const key of Object.keys(extras)) {
    payload[key] = {
      quantity: extras[key].quantity,
      note: extras[key].note,
    };
  }
  return payload;
}

function summarizePreacherExtras(extras: PreacherExtras) {
  const selected = Object.keys(extras)
    .filter((key) => extras[key].quantity > 0)
    .map((key) => `${titleCase(key)} x${extras[key].quantity}`);
  return selected.length ? selected.join(", ") : "No extras selected";
}

function getFieldOptions(options: OrderFormOption[], formType: OrderFormType, fieldKey: OrderFieldKey, fallback: string[]) {
  const labels = options
    .filter((option) => option.form_type === formType && option.field_key === fieldKey && option.active)
    .sort((left, right) => left.sort_order - right.sort_order || left.label.localeCompare(right.label))
    .map((option) => option.label);
  return labels.length ? labels : fallback;
}

function getOrderBadgeLabel(order: CoffeeOrder) {
  return order.order_type === "preacher" ? "Special" : "Normal";
}

function formatOrderSummary(order: CoffeeOrder) {
  const label = order.order_type === "preacher" ? "Special Order" : "Order";
  const guest = order.guest_name ? ` + ${order.guest_name}` : "";
  return `${label}: ${order.recipient_name}${guest} ${order.coffee_type}`;
}

function sortOrders(items: CoffeeOrder[]) {
  return [...items].sort((left, right) => {
    if (left.order_type !== right.order_type) {
      return left.order_type === "preacher" ? -1 : 1;
    }
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
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
  const { isAdmin, isOperator, isPastor, isCafe, profile } = useAuth();

  const items: Array<{ view: View; label: string; icon: typeof LayoutDashboard }> = [
    { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  if (isPastor) {
    items.push({ view: "orders", label: "Order", icon: Coffee });
  }

  if (isAdmin || isOperator) {
    items.push({ view: "orders", label: "Orders", icon: Coffee });
  }

  if (isAdmin || isCafe) {
    items.push({ view: "cafe", label: "Cafe", icon: Coffee });
  }

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
  coffeeOptions,
  milkOptions,
  sugarOptions,
  heatOptions,
  coffeeType,
  milkType,
  sugarType,
  milkHeat,
  onCoffeeType,
  onMilkType,
  onSugarType,
  onMilkHeat,
}: {
  coffeeOptions: CoffeeType[];
  milkOptions: MilkType[];
  sugarOptions: SugarType[];
  heatOptions: HeatLevel[];
  coffeeType: CoffeeType;
  milkType: MilkType;
  sugarType: SugarType;
  milkHeat: HeatLevel;
  onCoffeeType: (value: CoffeeType) => void;
  onMilkType: (value: MilkType) => void;
  onSugarType: (value: SugarType) => void;
  onMilkHeat: (value: HeatLevel) => void;
}) {
  return (
    <>
      <label>
        Coffee type
        <select value={coffeeType} onChange={(event) => onCoffeeType(event.target.value as CoffeeType)}>
          {coffeeOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        Milk type
        <select value={milkType} onChange={(event) => onMilkType(event.target.value as MilkType)}>
          {milkOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        Sugar type
        <select value={sugarType} onChange={(event) => onSugarType(event.target.value as SugarType)}>
          {sugarOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        Heated
        <select value={milkHeat} onChange={(event) => onMilkHeat(event.target.value as HeatLevel)}>
          {heatOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <small className="field-hint">55 to 60 is immediate temperature. 60 to 65 is correct cappachino temperature. 70 degrees is very hot.</small>
      </label>
    </>
  );
}

function PreacherExtrasEditor({
  extras,
  onChange,
}: {
  extras: PreacherExtras;
  onChange: (extras: PreacherExtras) => void;
}) {
  const updateExtra = (key: PreacherExtraKey, field: keyof PreacherExtraValue, value: string | number) => {
    onChange({
      ...extras,
      [key]: {
        ...extras[key],
        [field]: field === "quantity" ? Number(value) : value,
      },
    });
  };

  return (
    <div className="list-stack">
      {preacherExtraKeys.map((key) => (
        <article className="list-item" key={key}>
          <div>
            <strong>{titleCase(key)}</strong>
          </div>
          <div className="admin-controls">
            <label>
              Qty
              <input
                type="number"
                min={0}
                value={extras[key].quantity}
                onChange={(event) => updateExtra(key, "quantity", event.target.value)}
              />
            </label>
            <label>
              Note
              <input value={extras[key].note} onChange={(event) => updateExtra(key, "note", event.target.value)} />
            </label>
          </div>
        </article>
      ))}
    </div>
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

function PreferenceSetupModal({
  onSave,
  coffeeOptions,
  milkOptions,
  sugarOptions,
  heatOptions,
}: {
  onSave: (values: { coffee_type: CoffeeType; milk_type: MilkType; sugar_type: SugarType; milk_heat: HeatLevel }) => Promise<void>;
  coffeeOptions: CoffeeType[];
  milkOptions: MilkType[];
  sugarOptions: SugarType[];
  heatOptions: HeatLevel[];
}) {
  const [coffeeType, setCoffeeType] = useState<CoffeeType>(coffeeOptions[0] ?? defaultCoffeeTypes[0]);
  const [milkType, setMilkType] = useState<MilkType>(milkOptions[0] ?? defaultMilkTypes[0]);
  const [sugarType, setSugarType] = useState<SugarType>(sugarOptions[0] ?? defaultSugarTypes[0]);
  const [milkHeat, setMilkHeat] = useState<HeatLevel>(heatOptions[0] ?? defaultHeatLevels[0]);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCoffeeType(coffeeOptions[0] ?? defaultCoffeeTypes[0]);
  }, [coffeeOptions]);

  useEffect(() => {
    setMilkType(milkOptions[0] ?? defaultMilkTypes[0]);
  }, [milkOptions]);

  useEffect(() => {
    setSugarType(sugarOptions[0] ?? defaultSugarTypes[0]);
  }, [sugarOptions]);

  useEffect(() => {
    setMilkHeat(heatOptions[0] ?? defaultHeatLevels[0]);
  }, [heatOptions]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await onSave({
        coffee_type: coffeeType,
        milk_type: milkType,
        sugar_type: sugarType,
        milk_heat: milkHeat,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save your preference.");
      setSaving(false);
      return;
    }

    setSaving(false);
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="login-bubble modal-bubble" role="dialog" aria-modal="true" aria-labelledby="preference-setup-title">
        <p className="eyebrow">Coffee preference</p>
        <h1 id="preference-setup-title">Set your first coffee preference</h1>
        <p className="app-subtitle">Tell eCafe how you want your coffee before you continue.</p>
        <form className="auth-form" onSubmit={handleSave}>
          <CoffeeSelects
            coffeeOptions={coffeeOptions}
            milkOptions={milkOptions}
            sugarOptions={sugarOptions}
            heatOptions={heatOptions}
            coffeeType={coffeeType}
            milkType={milkType}
            sugarType={sugarType}
            milkHeat={milkHeat}
            onCoffeeType={setCoffeeType}
            onMilkType={setMilkType}
            onSugarType={setSugarType}
            onMilkHeat={setMilkHeat}
          />
          {message ? <p className="form-message">{message}</p> : null}
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save preference"}
          </button>
        </form>
      </section>
    </div>
  );
}

function ProfilePage({
  preference,
  onPreferenceSaved,
  coffeeOptions,
  milkOptions,
  sugarOptions,
  heatOptions,
}: {
  preference: Preference | null;
  onPreferenceSaved: () => Promise<void>;
  coffeeOptions: CoffeeType[];
  milkOptions: MilkType[];
  sugarOptions: SugarType[];
  heatOptions: HeatLevel[];
}) {
  const { isOperator, isPastor, profile, user, refreshAccess } = useAuth();
  const canManagePreference = isPastor || isOperator;
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [profileNotes, setProfileNotes] = useState(profile?.profile_notes ?? "");
  const [coffeeType, setCoffeeType] = useState<CoffeeType>(preference?.coffee_type ?? coffeeOptions[0] ?? defaultCoffeeTypes[0]);
  const [milkType, setMilkType] = useState<MilkType>(preference?.milk_type ?? milkOptions[0] ?? defaultMilkTypes[0]);
  const [sugarType, setSugarType] = useState<SugarType>(preference?.sugar_type ?? sugarOptions[0] ?? defaultSugarTypes[0]);
  const [milkHeat, setMilkHeat] = useState<HeatLevel>(preference?.milk_heat ?? heatOptions[0] ?? defaultHeatLevels[0]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setProfileNotes(profile?.profile_notes ?? "");
  }, [profile]);

  useEffect(() => {
    setCoffeeType(preference?.coffee_type ?? coffeeOptions[0] ?? defaultCoffeeTypes[0]);
    setMilkType(preference?.milk_type ?? milkOptions[0] ?? defaultMilkTypes[0]);
    setSugarType(preference?.sugar_type ?? sugarOptions[0] ?? defaultSugarTypes[0]);
    setMilkHeat(preference?.milk_heat ?? heatOptions[0] ?? defaultHeatLevels[0]);
  }, [preference, coffeeOptions, milkOptions, sugarOptions, heatOptions]);

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
    if (!user || !canManagePreference) return;

    const { error } = await supabase.from("coffee_preferences").upsert({
      user_id: user.id,
      coffee_type: coffeeType,
      milk_type: milkType,
      sugar_type: sugarType,
      milk_heat: milkHeat,
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

      {canManagePreference ? (
        <form className="auth-form form-panel" onSubmit={savePreference}>
          <div>
            <p className="eyebrow">Preference</p>
            <h2 className="section-title">Coffee preference</h2>
          </div>
          <CoffeeSelects
            coffeeOptions={coffeeOptions}
            milkOptions={milkOptions}
            sugarOptions={sugarOptions}
            heatOptions={heatOptions}
            coffeeType={coffeeType}
            milkType={milkType}
            sugarType={sugarType}
            milkHeat={milkHeat}
            onCoffeeType={setCoffeeType}
            onMilkType={setMilkType}
            onSugarType={setSugarType}
            onMilkHeat={setMilkHeat}
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
  const { isAdmin, isOperator, isPastor, isCafe, roles: currentRoles } = useAuth();

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
        {isAdmin || isCafe ? (
          <button className="action-card" type="button" onClick={() => setView("cafe")}>
            <Coffee aria-hidden="true" />
            <span>Cafe</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}

function UsersAdminPanel({
  users,
  roleSelections,
  message,
  onRoleChange,
  onDeleteUser,
  onApproveUser,
  onSaveRole,
}: {
  users: ManagedUser[];
  roleSelections: Record<string, AppRole>;
  message: string | null;
  onRoleChange: (userId: string, role: AppRole) => void;
  onDeleteUser: (managedUser: ManagedUser) => Promise<void>;
  onApproveUser: (managedUser: ManagedUser) => Promise<void>;
  onSaveRole: (managedUser: ManagedUser) => Promise<void>;
}) {
  return (
    <section className="page-panel">
      <p className="eyebrow">Users</p>
      <h1>User roles</h1>
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
                <select value={selectedRole} onChange={(event) => onRoleChange(managedUser.id, event.target.value as AppRole)}>
                  {adminRoles.map((role) => (
                    <option key={role} value={role}>
                      {titleCase(role)}
                    </option>
                  ))}
                </select>
                <button
                  className={managedUser.approved ? "text-button" : "primary-button"}
                  type="button"
                  onClick={() => void (managedUser.approved ? onDeleteUser(managedUser) : onApproveUser(managedUser))}
                >
                  {managedUser.approved ? "Delete" : "Approve"}
                </button>
                <button className="text-button" type="button" onClick={() => void onSaveRole(managedUser)}>
                  Save role
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FormBuilderAdminPanel({
  formOptions,
  builderFormType,
  builderFieldKey,
  newOptionLabel,
  message,
  onBuilderFormTypeChange,
  onBuilderFieldKeyChange,
  onNewOptionLabelChange,
  onAddFormOption,
  onToggleFormOption,
  onDeleteFormOption,
}: {
  formOptions: OrderFormOption[];
  builderFormType: OrderFormType;
  builderFieldKey: OrderFieldKey;
  newOptionLabel: string;
  message: string | null;
  onBuilderFormTypeChange: (value: OrderFormType) => void;
  onBuilderFieldKeyChange: (value: OrderFieldKey) => void;
  onNewOptionLabelChange: (value: string) => void;
  onAddFormOption: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onToggleFormOption: (option: OrderFormOption) => Promise<void>;
  onDeleteFormOption: (optionId: string) => Promise<void>;
}) {
  const builderOptions = formOptions.filter(
    (option) => option.form_type === builderFormType && option.field_key === builderFieldKey,
  );

  return (
    <section className="page-panel">
      <p className="eyebrow">Form Builder</p>
      <h1>Build submitted forms</h1>
      <p className="app-subtitle">Choose a form type and field, then add the items users can select.</p>
      {message ? <p className="form-message">{message}</p> : null}
      <form className="auth-form form-panel" onSubmit={(event) => void onAddFormOption(event)}>
        <label>
          Form type
          <select value={builderFormType} onChange={(event) => onBuilderFormTypeChange(event.target.value as OrderFormType)}>
            <option value="normal">Normal order</option>
            <option value="preacher">Special order</option>
          </select>
        </label>
        <label>
          Field type
          <select value={builderFieldKey} onChange={(event) => onBuilderFieldKeyChange(event.target.value as OrderFieldKey)}>
            <option value="coffee_type">Coffee type</option>
            <option value="milk_type">Milk type</option>
            <option value="sugar_type">Sugar type</option>
            <option value="milk_heat">Heated</option>
            <option value="extra_item">Extra items</option>
          </select>
        </label>
        <label>
          Add item
          <input value={newOptionLabel} onChange={(event) => onNewOptionLabelChange(event.target.value)} placeholder="Add selectable option" />
        </label>
        <button className="primary-button" type="submit">
          Add item
        </button>
      </form>
      <div className="list-stack">
        {builderOptions.map((option) => (
          <article className="list-item" key={option.id}>
            <div>
              <strong>{option.label}</strong>
              <p>{builderFieldLabels[option.field_key]}</p>
            </div>
            <div className="admin-controls">
              <button className="text-button" type="button" onClick={() => void onToggleFormOption(option)}>
                {option.active ? "Disable" : "Enable"}
              </button>
              <button className="text-button" type="button" onClick={() => void onDeleteFormOption(option.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminAccountPage({
  section,
  setSection,
  children,
}: {
  section: AdminAccountSection;
  setSection: (value: AdminAccountSection) => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="eyebrow">Account</p>
      <h1>Admin account</h1>
      <div className="button-row">
        <button className={section === "profile" ? "primary-button" : "text-button"} type="button" onClick={() => setSection("profile")}>
          Profile
        </button>
        <button className={section === "users" ? "primary-button" : "text-button"} type="button" onClick={() => setSection("users")}>
          Users
        </button>
        <button className={section === "builder" ? "primary-button" : "text-button"} type="button" onClick={() => setSection("builder")}>
          Form Builder
        </button>
      </div>
      {children}
    </section>
  );
}

function AdminPage({ section }: { section: Exclude<AdminAccountSection, "profile"> }) {
  const { user } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roleSelections, setRoleSelections] = useState<Record<string, AppRole>>({});
  const [formOptions, setFormOptions] = useState<OrderFormOption[]>([]);
  const [builderFormType, setBuilderFormType] = useState<OrderFormType>("normal");
  const [builderFieldKey, setBuilderFieldKey] = useState<OrderFieldKey>("coffee_type");
  const [newOptionLabel, setNewOptionLabel] = useState("");
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
        .filter((row) => ["admin", "pastor", "operator", "cafe"].includes(row.role))
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
    void loadFormOptions();
  }, []);

  const loadFormOptions = async () => {
    const { data, error } = await supabase
      .from("order_form_options")
      .select("*")
      .order("form_type", { ascending: true })
      .order("field_key", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setFormOptions((data ?? []) as OrderFormOption[]);
  };

  const deleteUser = async (managedUser: ManagedUser) => {
    const { error } = await supabase.rpc("admin_delete_user", { target_user_id: managedUser.id });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("User deleted.");
    await loadUsers();
  };

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

  const saveRoleOnly = async (managedUser: ManagedUser) => {
    const selectedRole = roleSelections[managedUser.id] ?? "pastor";

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        requested_role: selectedRole,
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

    if (managedUser.approved) {
      const { error: roleError } = await supabase.from("user_roles").insert({ user_id: managedUser.id, role: selectedRole });
      if (roleError) {
        setMessage(roleError.message);
        return;
      }
    }

    setMessage("Role saved.");
    await loadUsers();
  };

  const addFormOption = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const label = newOptionLabel.trim();
    if (!label) return;

    const existing = formOptions.filter((option) => option.form_type === builderFormType && option.field_key === builderFieldKey);
    const nextSortOrder = existing.length ? Math.max(...existing.map((option) => option.sort_order)) + 1 : 1;

    const { error } = await supabase.from("order_form_options").insert({
      form_type: builderFormType,
      field_key: builderFieldKey,
      label,
      sort_order: nextSortOrder,
      active: true,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setNewOptionLabel("");
    setMessage("Form option added.");
    await loadFormOptions();
  };

  const toggleFormOption = async (option: OrderFormOption) => {
    const { error } = await supabase.from("order_form_options").update({ active: !option.active }).eq("id", option.id);
    if (error) {
      setMessage(error.message);
      return;
    }

    await loadFormOptions();
  };

  const deleteFormOption = async (optionId: string) => {
    const { error } = await supabase.from("order_form_options").delete().eq("id", optionId);
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Form option deleted.");
    await loadFormOptions();
  };

  return (
    section === "users" ? (
      <UsersAdminPanel
        users={users}
        roleSelections={roleSelections}
        message={message}
        onRoleChange={(userId, role) =>
          setRoleSelections((current) => ({
            ...current,
            [userId]: role,
          }))
        }
        onDeleteUser={deleteUser}
        onApproveUser={(managedUser) => updateUser(managedUser, true)}
        onSaveRole={saveRoleOnly}
      />
    ) : (
      <FormBuilderAdminPanel
        formOptions={formOptions}
        builderFormType={builderFormType}
        builderFieldKey={builderFieldKey}
        newOptionLabel={newOptionLabel}
        message={message}
        onBuilderFormTypeChange={setBuilderFormType}
        onBuilderFieldKeyChange={setBuilderFieldKey}
        onNewOptionLabelChange={setNewOptionLabel}
        onAddFormOption={addFormOption}
        onToggleFormOption={toggleFormOption}
        onDeleteFormOption={deleteFormOption}
      />
    )
  );
}

function OrderDetailPanel({
  order,
  isAdmin,
  canChangeStatus,
  pastors,
  formConfig,
  onClose,
  onStatusChange,
  onOrderChange,
  onDeleteOrder,
}: OrderDetailPanelProps) {
  const [draftName, setDraftName] = useState(order.recipient_name);
  const [draftPastorId, setDraftPastorId] = useState(order.pastor_id ?? "");
  const [draftGuestName, setDraftGuestName] = useState(order.guest_name ?? "");
  const [draftGuestDetails, setDraftGuestDetails] = useState(order.guest_details ?? "");
  const [draftCustomExtraItems, setDraftCustomExtraItems] = useState(order.custom_extra_items ?? "");
  const [draftCoffeeType, setDraftCoffeeType] = useState<CoffeeType>(order.coffee_type);
  const [draftMilkType, setDraftMilkType] = useState<MilkType>(order.milk_type);
  const [draftSugarType, setDraftSugarType] = useState<SugarType>(order.sugar_type);
  const [draftMilkHeat, setDraftMilkHeat] = useState<HeatLevel>(order.milk_heat);
  const [draftNotes, setDraftNotes] = useState(order.notes ?? "");
  const [draftExtras, setDraftExtras] = useState<PreacherExtras>(
    normalizePreacherExtras(order.preacher_extras, formConfig.preacherExtraOptions),
  );

  useEffect(() => {
    setDraftName(order.recipient_name);
    setDraftPastorId(order.pastor_id ?? "");
    setDraftGuestName(order.guest_name ?? "");
    setDraftGuestDetails(order.guest_details ?? "");
    setDraftCustomExtraItems(order.custom_extra_items ?? "");
    setDraftCoffeeType(order.coffee_type);
    setDraftMilkType(order.milk_type);
    setDraftSugarType(order.sugar_type);
    setDraftMilkHeat(order.milk_heat);
    setDraftNotes(order.notes ?? "");
    setDraftExtras(normalizePreacherExtras(order.preacher_extras, formConfig.preacherExtraOptions));
  }, [formConfig.preacherExtraOptions, order]);

  const saveAdminChanges = async () => {
    const selectedPastor = pastors.find((pastor) => pastor.id === draftPastorId);
    await onOrderChange(order, {
      pastor_id: draftPastorId || null,
      recipient_name: selectedPastor ? getPastorName(selectedPastor) : draftName,
      guest_name: order.order_type === "preacher" ? draftGuestName || null : null,
      guest_details: order.order_type === "preacher" ? draftGuestDetails || null : null,
      custom_extra_items: order.order_type === "preacher" ? draftCustomExtraItems || null : null,
      preacher_extras: order.order_type === "preacher" ? extrasToJson(draftExtras) : null,
      coffee_type: draftCoffeeType,
      milk_type: draftMilkType,
      sugar_type: draftSugarType,
      milk_heat: draftMilkHeat,
      notes: draftNotes || null,
    });
  };

  return (
    <section className="page-panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">{order.order_type === "preacher" ? "Special order" : "Order detail"}</p>
          <h2 className="section-title">{order.recipient_name}</h2>
        </div>
        <button className="text-button" type="button" onClick={onClose}>
          Back to orders
        </button>
      </div>

      <div className="list-stack">
        <article className="list-item">
          <div>
            <strong>Order type</strong>
            <p>{getOrderBadgeLabel(order)}</p>
          </div>
          <span className="role-pill">{getOrderBadgeLabel(order)}</span>
        </article>
        <article className="list-item">
          <div>
            <strong>Status</strong>
            <p>{titleCase(order.status)}</p>
          </div>
          {canChangeStatus ? (
            <select value={order.status} onChange={(event) => void onStatusChange(order.id, event.target.value as OrderStatus)}>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {titleCase(status)}
                </option>
              ))}
            </select>
          ) : (
            <span className="role-pill">{titleCase(order.status)}</span>
          )}
        </article>
      </div>

      {isAdmin ? (
        <form
          className="auth-form form-panel"
          onSubmit={(event) => {
            event.preventDefault();
            void saveAdminChanges();
          }}
        >
          <label>
            Linked pastor
            <select value={draftPastorId} onChange={(event) => setDraftPastorId(event.target.value)}>
              <option value="">No linked pastor</option>
              {pastors.map((pastor) => (
                <option key={pastor.id} value={pastor.id}>
                  {getPastorName(pastor)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Name on order
            <input value={draftName} onChange={(event) => setDraftName(event.target.value)} />
          </label>
          <CoffeeSelects
            coffeeOptions={formConfig.coffeeOptions}
            milkOptions={formConfig.milkOptions}
            sugarOptions={formConfig.sugarOptions}
            heatOptions={formConfig.heatOptions}
            coffeeType={draftCoffeeType}
            milkType={draftMilkType}
            sugarType={draftSugarType}
            milkHeat={draftMilkHeat}
            onCoffeeType={setDraftCoffeeType}
            onMilkType={setDraftMilkType}
            onSugarType={setDraftSugarType}
            onMilkHeat={setDraftMilkHeat}
          />
          {order.order_type === "preacher" ? (
            <>
              <label>
                Guest / preacher name
                <input value={draftGuestName} onChange={(event) => setDraftGuestName(event.target.value)} />
              </label>
              <label>
                Guest / preacher details
                <textarea value={draftGuestDetails} onChange={(event) => setDraftGuestDetails(event.target.value)} rows={3} />
              </label>
              <div>
                <p className="eyebrow">Extras</p>
                <PreacherExtrasEditor extras={draftExtras} onChange={setDraftExtras} />
              </div>
              <label>
                Custom extra items
                <textarea value={draftCustomExtraItems} onChange={(event) => setDraftCustomExtraItems(event.target.value)} rows={3} />
              </label>
            </>
          ) : null}
          <label>
            Notes
            <textarea value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} rows={3} />
          </label>
          <button className="primary-button" type="submit">
            Save order
          </button>
          <button className="text-button" type="button" onClick={() => void onDeleteOrder(order.id)}>
            Delete order
          </button>
        </form>
      ) : (
        <div className="list-stack">
          <article className="list-item">
            <div>
              <strong>Coffee</strong>
              <p>
                {order.coffee_type}, {order.milk_type}, {order.sugar_type}, {order.milk_heat}
              </p>
            </div>
          </article>
          {order.order_type === "preacher" ? (
            <>
              <article className="list-item">
                <div>
                  <strong>Guest / preacher</strong>
                  <p>{order.guest_name || "No guest person added."}</p>
                  <p>{order.guest_details || "No extra people details."}</p>
                </div>
              </article>
              <article className="list-item">
                <div>
                  <strong>Extras</strong>
                  <p>{summarizePreacherExtras(normalizePreacherExtras(order.preacher_extras, formConfig.preacherExtraOptions))}</p>
                  <p>{order.custom_extra_items || "No custom extra items."}</p>
                </div>
              </article>
            </>
          ) : null}
          <article className="list-item">
            <div>
              <strong>Notes</strong>
              <p>{order.notes || "No notes added."}</p>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

function OrdersPage({
  preference,
  reloadPreference,
  formConfig,
}: {
  preference: Preference | null;
  reloadPreference: () => Promise<void>;
  formConfig: OrderFormConfig;
}) {
  const { isAdmin, isOperator, isPastor, user, profile } = useAuth();
  const [orders, setOrders] = useState<CoffeeOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [pastors, setPastors] = useState<PastorOption[]>([]);
  const [operatorMode, setOperatorMode] = useState<OperatorOrderMode>("normal");
  const [selectedPastorId, setSelectedPastorId] = useState("");
  const [preacherTargetMode, setPreacherTargetMode] = useState<PreacherTargetMode>("pastor");
  const [guestName, setGuestName] = useState("");
  const [guestDetails, setGuestDetails] = useState("");
  const [customExtraItems, setCustomExtraItems] = useState("");
  const [preacherExtras, setPreacherExtras] = useState<PreacherExtras>(createEmptyPreacherExtras(formConfig.preacherExtraOptions));
  const [recipientName, setRecipientName] = useState(profile?.full_name || profile?.email || "");
  const [coffeeType, setCoffeeType] = useState<CoffeeType>(preference?.coffee_type ?? formConfig.coffeeOptions[0] ?? defaultCoffeeTypes[0]);
  const [milkType, setMilkType] = useState<MilkType>(preference?.milk_type ?? formConfig.milkOptions[0] ?? defaultMilkTypes[0]);
  const [sugarType, setSugarType] = useState<SugarType>(preference?.sugar_type ?? formConfig.sugarOptions[0] ?? defaultSugarTypes[0]);
  const [milkHeat, setMilkHeat] = useState<HeatLevel>(preference?.milk_heat ?? formConfig.heatOptions[0] ?? defaultHeatLevels[0]);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const canSeeQueue = isAdmin || isOperator || isPastor;
  const canPreviewOperatorForm = isAdmin || isOperator;

  const loadOrders = useCallback(async () => {
    const { data, error } = await supabase.from("coffee_orders").select("*");
    if (error) {
      setMessage(error.message);
      return;
    }
    setOrders(sortOrders((data ?? []) as CoffeeOrder[]));
  }, []);

  const loadPastors = useCallback(async () => {
    if (!isOperator && !isAdmin) {
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
  }, [isAdmin, isOperator, selectedPastorId]);

  useEffect(() => {
    if (canSeeQueue) void loadOrders();
  }, [canSeeQueue, loadOrders]);

  useEffect(() => {
    if (selectedOrderId && !orders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(null);
    }
  }, [orders, selectedOrderId]);

  useEffect(() => {
    void loadPastors();
  }, [loadPastors]);

  useEffect(() => {
    if (preference) {
      setCoffeeType(preference.coffee_type);
      setMilkType(preference.milk_type);
      setSugarType(preference.sugar_type);
      setMilkHeat(preference.milk_heat);
    }
  }, [preference]);

  useEffect(() => {
    if (!preference) {
      setCoffeeType((current) => (formConfig.coffeeOptions.includes(current) ? current : formConfig.coffeeOptions[0] ?? defaultCoffeeTypes[0]));
      setMilkType((current) => (formConfig.milkOptions.includes(current) ? current : formConfig.milkOptions[0] ?? defaultMilkTypes[0]));
      setSugarType((current) => (formConfig.sugarOptions.includes(current) ? current : formConfig.sugarOptions[0] ?? defaultSugarTypes[0]));
      setMilkHeat((current) => (formConfig.heatOptions.includes(current) ? current : formConfig.heatOptions[0] ?? defaultHeatLevels[0]));
    }
  }, [formConfig.coffeeOptions, formConfig.heatOptions, formConfig.milkOptions, formConfig.sugarOptions, preference]);

  useEffect(() => {
    setPreacherExtras((current) => normalizePreacherExtras(extrasToJson(current), formConfig.preacherExtraOptions));
  }, [formConfig.preacherExtraOptions]);

  useEffect(() => {
    if (isPastor) {
      setRecipientName(profile?.full_name || profile?.email || "");
    }
  }, [isPastor, profile?.email, profile?.full_name]);

  const resetOperatorDraft = () => {
    setGuestName("");
    setGuestDetails("");
    setCustomExtraItems("");
    setPreacherExtras(createEmptyPreacherExtras(formConfig.preacherExtraOptions));
    setNotes("");
  };

  const createPastorOrder = async (event?: React.FormEvent<HTMLFormElement>, usePreference = false) => {
    event?.preventDefault();
    if (!user || !isPastor) return;

    const source =
      usePreference && preference
        ? preference
        : { coffee_type: coffeeType, milk_type: milkType, sugar_type: sugarType, milk_heat: milkHeat };
    const { error } = await supabase.from("coffee_orders").insert({
      created_by: user.id,
      pastor_id: user.id,
      order_type: "normal",
      recipient_name: profile?.full_name || profile?.email || "Pastor",
      guest_name: null,
      guest_details: null,
      custom_extra_items: null,
      preacher_extras: null,
      coffee_type: source.coffee_type,
      milk_type: source.milk_type,
      sugar_type: source.sugar_type,
      milk_heat: source.milk_heat,
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

    if (operatorMode === "normal") {
      if (!targetPastor) {
        setMessage("Choose a pastor first.");
        return;
      }

      const { error } = await supabase.from("coffee_orders").insert({
        created_by: user.id,
        pastor_id: targetPastor.id,
        order_type: "normal",
        recipient_name: getPastorName(targetPastor),
        guest_name: null,
        guest_details: null,
        custom_extra_items: null,
        preacher_extras: null,
        coffee_type: coffeeType,
        milk_type: milkType,
        sugar_type: sugarType,
        milk_heat: milkHeat,
        notes: notes || null,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Order submitted for pastor.");
      setNotes("");
      await loadOrders();
      return;
    }

    const isGuestMode = preacherTargetMode === "guest";
    if (!isGuestMode && !targetPastor) {
        setMessage("Choose a pastor for the special order.");
      return;
    }
    if (isGuestMode && !guestName.trim()) {
      setMessage("Add the guest / preacher name.");
      return;
    }

    const recipient = isGuestMode ? guestName.trim() : getPastorName(targetPastor as PastorOption);
    const { error } = await supabase.from("coffee_orders").insert({
      created_by: user.id,
      pastor_id: isGuestMode ? null : targetPastor?.id ?? null,
      order_type: "preacher",
      recipient_name: recipient,
      guest_name: guestName.trim() || null,
      guest_details: guestDetails.trim() || null,
      custom_extra_items: customExtraItems.trim() || null,
      preacher_extras: extrasToJson(preacherExtras),
      coffee_type: coffeeType,
      milk_type: milkType,
      sugar_type: sugarType,
      milk_heat: milkHeat,
      notes: notes || null,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Special order submitted.");
    resetOperatorDraft();
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
      order_type: values.order_type ?? order.order_type,
      recipient_name: values.recipient_name ?? order.recipient_name,
      guest_name: values.guest_name ?? order.guest_name,
      guest_details: values.guest_details ?? order.guest_details,
      custom_extra_items: values.custom_extra_items ?? order.custom_extra_items,
      preacher_extras: values.preacher_extras ?? order.preacher_extras,
      coffee_type: values.coffee_type ?? order.coffee_type,
      milk_type: values.milk_type ?? order.milk_type,
      sugar_type: values.sugar_type ?? order.sugar_type,
      milk_heat: values.milk_heat ?? order.milk_heat,
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

  const deleteOrder = async (orderId: string) => {
    const { error } = await supabase.from("coffee_orders").delete().eq("id", orderId);
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Order deleted.");
    setSelectedOrderId(null);
    await loadOrders();
  };

  const preferenceLabel = useMemo(() => {
    if (!preference) return "No preference saved";
    return `${preference.coffee_type}, ${preference.milk_type}, ${preference.sugar_type}, ${preference.milk_heat}`;
  }, [preference]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  if (selectedOrder) {
    return (
      <OrderDetailPanel
        order={selectedOrder}
        isAdmin={isAdmin}
        canChangeStatus={false}
        pastors={pastors}
        formConfig={formConfig}
        onClose={() => setSelectedOrderId(null)}
        onStatusChange={updateStatus}
        onOrderChange={updateOrderDetails}
        onDeleteOrder={deleteOrder}
      />
    );
  }

  return (
    <section className="page-panel">
      <p className="eyebrow">Orders</p>
      <h1>{isPastor && !isAdmin && !isOperator ? "Order coffee" : "Orders"}</h1>
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
              coffeeOptions={formConfig.coffeeOptions}
              milkOptions={formConfig.milkOptions}
              sugarOptions={formConfig.sugarOptions}
              heatOptions={formConfig.heatOptions}
              coffeeType={coffeeType}
              milkType={milkType}
              sugarType={sugarType}
              milkHeat={milkHeat}
              onCoffeeType={setCoffeeType}
              onMilkType={setMilkType}
              onSugarType={setSugarType}
              onMilkHeat={setMilkHeat}
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

      {canPreviewOperatorForm ? (
        <form className="auth-form form-panel" onSubmit={createOperatorOrder}>
          <div>
            <p className="eyebrow">Operator order</p>
            <h2 className="section-title">Create an order</h2>
            {isAdmin && !isOperator ? <p className="app-subtitle">Preview of the operator order form.</p> : null}
          </div>

          <div className="button-row">
            <button
              className={operatorMode === "normal" ? "primary-button" : "text-button"}
              type="button"
              onClick={() => setOperatorMode("normal")}
            >
              Normal order
            </button>
            <button
              className={operatorMode === "preacher" ? "primary-button" : "text-button"}
              type="button"
              onClick={() => setOperatorMode("preacher")}
            >
              Special order
            </button>
          </div>

          {operatorMode === "normal" ? (
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
          ) : (
            <>
              <div className="button-row">
                <button
                  className={preacherTargetMode === "pastor" ? "primary-button" : "text-button"}
                  type="button"
                  onClick={() => setPreacherTargetMode("pastor")}
                >
                  Linked pastor
                </button>
                <button
                  className={preacherTargetMode === "guest" ? "primary-button" : "text-button"}
                  type="button"
                  onClick={() => setPreacherTargetMode("guest")}
                >
                  Guest preacher
                </button>
              </div>

              {preacherTargetMode === "pastor" ? (
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
              ) : null}

              <label>
                Guest / preacher name
                <input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Add a guest name if needed" />
              </label>
              <label>
                Guest / preacher details
                <textarea
                  value={guestDetails}
                  onChange={(event) => setGuestDetails(event.target.value)}
                  rows={3}
                  placeholder="Phone, seating, contact, or ministry details"
                />
              </label>
            </>
          )}

          <CoffeeSelects
            coffeeOptions={formConfig.coffeeOptions}
            milkOptions={formConfig.milkOptions}
            sugarOptions={formConfig.sugarOptions}
            heatOptions={formConfig.heatOptions}
            coffeeType={coffeeType}
            milkType={milkType}
            sugarType={sugarType}
            milkHeat={milkHeat}
            onCoffeeType={setCoffeeType}
            onMilkType={setMilkType}
            onSugarType={setSugarType}
            onMilkHeat={setMilkHeat}
          />

          {operatorMode === "preacher" ? (
            <>
              <div>
                <p className="eyebrow">Cafe service extras</p>
                <PreacherExtrasEditor extras={preacherExtras} onChange={setPreacherExtras} />
              </div>
              <label>
                Custom extra items
                <textarea value={customExtraItems} onChange={(event) => setCustomExtraItems(event.target.value)} rows={3} />
              </label>
            </>
          ) : null}

          <label>
            Notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          </label>
          <button className="primary-button" type="submit">
            {operatorMode === "preacher" ? "Submit special order" : "Submit for pastor"}
          </button>
        </form>
      ) : null}

      {canSeeQueue ? (
        <div className="list-stack">
          {orders.map((order) => (
            <article className="list-item" key={order.id}>
              <div className="order-item-details">
                <strong>{formatOrderSummary(order)}</strong>
              </div>
              <div className="admin-controls">
                <span className="role-pill">{getOrderBadgeLabel(order)}</span>
                <span className="role-pill">{titleCase(order.status)}</span>
                <button className="text-button" type="button" onClick={() => setSelectedOrderId(order.id)}>
                  Open
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function CafePage({ formConfig }: { formConfig: OrderFormConfig }) {
  const { isAdmin, isCafe } = useAuth();
  const [orders, setOrders] = useState<CoffeeOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [pastors, setPastors] = useState<PastorOption[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const { data, error } = await supabase.from("coffee_orders").select("*");
    if (error) {
      setMessage(error.message);
      return;
    }
    setOrders(sortOrders((data ?? []) as CoffeeOrder[]));
  }, []);

  const loadPastors = useCallback(async () => {
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
    setPastors(((profilesData ?? []) as Array<PastorOption & { approved?: boolean }>).filter((entry) => pastorIds.has(entry.id)));
  }, []);

  useEffect(() => {
    if (isAdmin || isCafe) {
      void loadOrders();
      void loadPastors();
    }
  }, [isAdmin, isCafe, loadOrders, loadPastors]);

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
      order_type: values.order_type ?? order.order_type,
      recipient_name: values.recipient_name ?? order.recipient_name,
      guest_name: values.guest_name ?? order.guest_name,
      guest_details: values.guest_details ?? order.guest_details,
      custom_extra_items: values.custom_extra_items ?? order.custom_extra_items,
      preacher_extras: values.preacher_extras ?? order.preacher_extras,
      coffee_type: values.coffee_type ?? order.coffee_type,
      milk_type: values.milk_type ?? order.milk_type,
      sugar_type: values.sugar_type ?? order.sugar_type,
      milk_heat: values.milk_heat ?? order.milk_heat,
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

  const deleteOrder = async (orderId: string) => {
    const { error } = await supabase.from("coffee_orders").delete().eq("id", orderId);
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Order deleted.");
    setSelectedOrderId(null);
    await loadOrders();
  };

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  if (selectedOrder) {
    return (
      <OrderDetailPanel
        order={selectedOrder}
        isAdmin={isAdmin}
        canChangeStatus={isCafe}
        pastors={pastors}
        formConfig={formConfig}
        onClose={() => setSelectedOrderId(null)}
        onStatusChange={updateStatus}
        onOrderChange={updateOrderDetails}
        onDeleteOrder={deleteOrder}
      />
    );
  }

  return (
    <section className="page-panel">
      <p className="eyebrow">Cafe</p>
      <h1>Order queue</h1>
      <p className="app-subtitle">All submitted orders arrive here for the cafe team.</p>
      {message ? <p className="form-message">{message}</p> : null}
      <div className="list-stack">
        {orders.map((order) => (
          <article className="list-item" key={order.id}>
            <div className="order-item-details">
              <strong>{formatOrderSummary(order)}</strong>
            </div>
            <div className="admin-controls">
              <span className="role-pill">{getOrderBadgeLabel(order)}</span>
              <span className="role-pill">{titleCase(order.status)}</span>
              <button className="text-button" type="button" onClick={() => setSelectedOrderId(order.id)}>
                Open
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AppShell() {
  const auth = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [adminAccountSection, setAdminAccountSection] = useState<AdminAccountSection>("profile");
  const [preference, setPreference] = useState<Preference | null>(null);
  const [formOptions, setFormOptions] = useState<OrderFormOption[]>([]);
  const [preferenceLoading, setPreferenceLoading] = useState(false);
  const [showPreferenceSetup, setShowPreferenceSetup] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const canUsePreferences = auth.isPastor || auth.isOperator;

  const loadFormOptions = useCallback(async () => {
    const { data } = await supabase
      .from("order_form_options")
      .select("*")
      .eq("active", true)
      .order("form_type", { ascending: true })
      .order("field_key", { ascending: true })
      .order("sort_order", { ascending: true });

    setFormOptions((data ?? []) as OrderFormOption[]);
  }, []);

  const loadPreference = useCallback(async () => {
    if (!auth.user || !canUsePreferences) {
      setPreference(null);
      setShowPreferenceSetup(false);
      return;
    }

    setPreferenceLoading(true);
    const { data } = await supabase.from("coffee_preferences").select("*").eq("user_id", auth.user.id).maybeSingle();
    const nextPreference = (data as Preference | null) ?? null;
    setPreference(nextPreference);
    setShowPreferenceSetup(!nextPreference);
    setPreferenceLoading(false);
  }, [auth.user, canUsePreferences]);

  const saveFirstPreference = async (values: {
    coffee_type: CoffeeType;
    milk_type: MilkType;
    sugar_type: SugarType;
    milk_heat: HeatLevel;
  }) => {
    if (!auth.user) throw new Error("No user found.");

    const { error } = await supabase.from("coffee_preferences").upsert({
      user_id: auth.user.id,
      ...values,
    });

    if (error) {
      throw new Error(error.message);
    }

    await loadPreference();
    setShowPreferenceSetup(false);
  };

  useEffect(() => {
    if (auth.isApproved) void loadPreference();
  }, [auth.isApproved, auth.user?.id, loadPreference]);

  useEffect(() => {
    if (auth.isApproved) void loadFormOptions();
  }, [auth.isApproved, loadFormOptions]);

  const formConfig = useMemo<OrderFormConfig>(
    () => ({
      coffeeOptions: getFieldOptions(formOptions, "normal", "coffee_type", [...defaultCoffeeTypes]),
      milkOptions: getFieldOptions(formOptions, "normal", "milk_type", [...defaultMilkTypes]),
      sugarOptions: getFieldOptions(formOptions, "normal", "sugar_type", [...defaultSugarTypes]),
      heatOptions: getFieldOptions(formOptions, "normal", "milk_heat", [...defaultHeatLevels]),
      preacherExtraOptions: getFieldOptions(formOptions, "preacher", "extra_item", [...defaultPreacherExtraLabels]),
    }),
    [formOptions],
  );

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
      <SidebarNav isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} view={view} setView={setView} />

      <section className="workspace-main">
        <header className="top-bar">
          <button className="brand-button" type="button" onClick={() => setView("dashboard")}>
            eCafe
          </button>
          <div className="button-row">
            <button
              className="icon-text-button"
              type="button"
              onClick={() => {
                if (auth.isAdmin) {
                  setAdminAccountSection("profile");
                  setView("account");
                  return;
                }
                setView("profile");
              }}
            >
              <UserRound size={18} aria-hidden="true" />
              {getDisplayName(auth.profile)}
            </button>
            <button className="text-button" type="button" onClick={auth.signOut}>
              Log out
            </button>
          </div>
        </header>

        {view === "dashboard" ? <Dashboard setView={setView} /> : null}
        {view === "orders" ? (
          <OrdersPage preference={preference} reloadPreference={loadPreference} formConfig={formConfig} />
        ) : null}
        {view === "cafe" && (auth.isAdmin || auth.isCafe) ? <CafePage formConfig={formConfig} /> : null}
        {view === "account" && auth.isAdmin ? (
          <AdminAccountPage section={adminAccountSection} setSection={setAdminAccountSection}>
            {adminAccountSection === "profile" ? (
              <ProfilePage
                preference={preference}
                onPreferenceSaved={loadPreference}
                coffeeOptions={formConfig.coffeeOptions}
                milkOptions={formConfig.milkOptions}
                sugarOptions={formConfig.sugarOptions}
                heatOptions={formConfig.heatOptions}
              />
            ) : (
              <AdminPage section={adminAccountSection} />
            )}
          </AdminAccountPage>
        ) : null}
        {view === "profile" ? (
          <ProfilePage
            preference={preference}
            onPreferenceSaved={loadPreference}
            coffeeOptions={formConfig.coffeeOptions}
            milkOptions={formConfig.milkOptions}
            sugarOptions={formConfig.sugarOptions}
            heatOptions={formConfig.heatOptions}
          />
        ) : null}
      </section>
      {showPreferenceSetup ? (
        <PreferenceSetupModal
          onSave={saveFirstPreference}
          coffeeOptions={formConfig.coffeeOptions}
          milkOptions={formConfig.milkOptions}
          sugarOptions={formConfig.sugarOptions}
          heatOptions={formConfig.heatOptions}
        />
      ) : null}
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
