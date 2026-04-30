import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, CheckSquare, Heart, ListChecks, Plus, Save, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type ExpenseRow = Tables<"wedding_expenses">;
type DonationRow = Tables<"wedding_donations">;
type ChecklistDivision = Tables<"wedding_checklist_divisions">;
type ChecklistItem = Tables<"wedding_checklist_items">;
type ExpenseSection = "barend_bianca" | "others_to_pay";
type WeddingTab = "budget" | "checklist";
type BusyTarget = string | null;

const sectionTitles: Record<ExpenseSection, string> = {
  barend_bianca: "Barend & Bianca Expenses",
  others_to_pay: "Others to Pay",
};

const currency = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 2,
});

const toMoney = (value: number | string | null | undefined) => {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
};

const nextSortOrder = (rows: Array<{ sort_order: number }>) =>
  rows.length === 0 ? 10 : Math.max(...rows.map((row) => row.sort_order)) + 10;

const weddingSurface =
  "rounded-[1.5rem] border border-black/10 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.14)]";

const weddingButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white disabled:pointer-events-none disabled:opacity-50";

const weddingGhostButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/18 bg-white text-black transition-colors hover:bg-black hover:text-white disabled:pointer-events-none disabled:opacity-50";

const weddingField =
  "flex h-11 w-full rounded-2xl border border-black/12 bg-white px-4 py-2 text-sm text-black outline-none transition-colors focus:border-black/25";

const weddingTextareaField =
  "flex min-h-[44px] w-full rounded-[1rem] border border-black/12 bg-white px-4 py-2 text-sm text-black outline-none transition-colors focus:border-black/25";

export default function Wedding() {
  const [activeTab, setActiveTab] = useState<WeddingTab>("budget");
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [divisions, setDivisions] = useState<ChecklistDivision[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [busyTarget, setBusyTarget] = useState<BusyTarget>(null);

  const loadBudget = useCallback(async () => {
    setLoading(true);

    const [{ data: expenseRows, error: expensesError }, { data: donationRows, error: donationsError }] = await Promise.all([
      supabase.from("wedding_expenses").select("*").order("section").order("sort_order"),
      supabase.from("wedding_donations").select("*").order("sort_order"),
    ]);

    setLoading(false);

    if (expensesError || donationsError) {
      toast.error(expensesError?.message ?? donationsError?.message ?? "Could not load wedding budget");
      setExpenses([]);
      setDonations([]);
      return;
    }

    setExpenses(expenseRows ?? []);
    setDonations(donationRows ?? []);
  }, []);

  useEffect(() => {
    void loadBudget();
  }, [loadBudget]);

  const loadChecklist = useCallback(async () => {
    setChecklistLoading(true);

    const [{ data: divisionRows, error: divisionsError }, { data: itemRows, error: itemsError }] = await Promise.all([
      supabase.from("wedding_checklist_divisions").select("*").order("sort_order"),
      supabase.from("wedding_checklist_items").select("*").order("sort_order"),
    ]);

    setChecklistLoading(false);

    if (divisionsError || itemsError) {
      toast.error(divisionsError?.message ?? itemsError?.message ?? "Could not load wedding checklist");
      setDivisions([]);
      setChecklistItems([]);
      return;
    }

    setDivisions(divisionRows ?? []);
    setChecklistItems(itemRows ?? []);
  }, []);

  useEffect(() => {
    if (activeTab === "checklist" && divisions.length === 0 && checklistItems.length === 0) {
      void loadChecklist();
    }
  }, [activeTab, checklistItems.length, divisions.length, loadChecklist]);

  const totals = useMemo(() => {
    const barendBiancaExpenses = expenses.filter((row) => row.section === "barend_bianca");
    const quotedExpenses = barendBiancaExpenses.reduce((sum, row) => sum + toMoney(row.quoted_amount), 0);
    const paidExpenses = barendBiancaExpenses.reduce((sum, row) => sum + toMoney(row.paid_amount), 0);
    const promisedDonations = donations.reduce((sum, row) => sum + toMoney(row.quoted_amount), 0);
    const paidDonations = donations.reduce((sum, row) => sum + toMoney(row.paid_amount), 0);

    return { quotedExpenses, paidExpenses, promisedDonations, paidDonations };
  }, [donations, expenses]);

  const updateExpense = (id: string, patch: Partial<ExpenseRow>) => {
    setExpenses((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const updateDonation = (id: string, patch: Partial<DonationRow>) => {
    setDonations((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const saveExpense = async (row: ExpenseRow) => {
    const itemName = row.item_name.trim();
    if (!itemName) {
      toast.error("Item name is required");
      return;
    }

    setBusyTarget(row.id);
    const { error } = await supabase
      .from("wedding_expenses")
      .update({
        item_name: itemName,
        quoted_amount: toMoney(row.quoted_amount),
        paid_amount: toMoney(row.paid_amount),
        note: row.note?.trim() || null,
      })
      .eq("id", row.id);

    setBusyTarget(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Expense saved");
    await loadBudget();
  };

  const saveDonation = async (row: DonationRow) => {
    const personName = row.person_name.trim();
    if (!personName) {
      toast.error("Name is required");
      return;
    }

    setBusyTarget(row.id);
    const { error } = await supabase
      .from("wedding_donations")
      .update({
        person_name: personName,
        quoted_amount: toMoney(row.quoted_amount),
        paid_amount: toMoney(row.paid_amount),
        note: row.note?.trim() || null,
      })
      .eq("id", row.id);

    setBusyTarget(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Donation saved");
    await loadBudget();
  };

  const addExpense = async (section: ExpenseSection) => {
    const sectionRows = expenses.filter((row) => row.section === section);
    setBusyTarget(`add-${section}`);

    const { error } = await supabase.from("wedding_expenses").insert({
      section,
      item_name: "New item",
      quoted_amount: 0,
      paid_amount: 0,
      sort_order: nextSortOrder(sectionRows),
    });

    setBusyTarget(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Expense added");
    await loadBudget();
  };

  const addDonation = async () => {
    setBusyTarget("add-donation");

    const { error } = await supabase.from("wedding_donations").insert({
      person_name: "New person",
      quoted_amount: 0,
      paid_amount: 0,
      sort_order: nextSortOrder(donations),
    });

    setBusyTarget(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Person added");
    await loadBudget();
  };

  const deleteExpense = async (row: ExpenseRow) => {
    setBusyTarget(row.id);
    const { error } = await supabase.from("wedding_expenses").delete().eq("id", row.id);
    setBusyTarget(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Expense deleted");
    await loadBudget();
  };

  const deleteDonation = async (row: DonationRow) => {
    setBusyTarget(row.id);
    const { error } = await supabase.from("wedding_donations").delete().eq("id", row.id);
    setBusyTarget(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Donation deleted");
    await loadBudget();
  };

  const updateDivision = (id: string, patch: Partial<ChecklistDivision>) => {
    setDivisions((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const updateChecklistItem = (id: string, patch: Partial<ChecklistItem>) => {
    setChecklistItems((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addDivision = async () => {
    setBusyTarget("add-division");
    const { error } = await supabase.from("wedding_checklist_divisions").insert({
      name: "New division",
      sort_order: nextSortOrder(divisions),
    });

    setBusyTarget(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Division added");
    await loadChecklist();
  };

  const saveDivision = async (division: ChecklistDivision) => {
    const name = division.name.trim();
    if (!name) {
      toast.error("Division name is required");
      return;
    }

    setBusyTarget(division.id);
    const { error } = await supabase.from("wedding_checklist_divisions").update({ name }).eq("id", division.id);
    setBusyTarget(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Division saved");
    await loadChecklist();
  };

  const deleteDivision = async (division: ChecklistDivision) => {
    setBusyTarget(division.id);
    const { error } = await supabase.from("wedding_checklist_divisions").delete().eq("id", division.id);
    setBusyTarget(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Division deleted");
    await loadChecklist();
  };

  const addChecklistItem = async (divisionId: string) => {
    const divisionItems = checklistItems.filter((row) => row.division_id === divisionId);
    setBusyTarget(`add-item-${divisionId}`);
    const { error } = await supabase.from("wedding_checklist_items").insert({
      division_id: divisionId,
      item_text: "New item",
      sort_order: nextSortOrder(divisionItems),
    });

    setBusyTarget(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Item added");
    await loadChecklist();
  };

  const saveChecklistItem = async (item: ChecklistItem) => {
    const itemText = item.item_text.trim();
    if (!itemText) {
      toast.error("Item text is required");
      return;
    }

    setBusyTarget(item.id);
    const { error } = await supabase.from("wedding_checklist_items").update({ item_text: itemText }).eq("id", item.id);
    setBusyTarget(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Item saved");
    await loadChecklist();
  };

  const toggleChecklistItem = async (item: ChecklistItem) => {
    const checked = !item.checked;
    updateChecklistItem(item.id, { checked, checked_at: checked ? new Date().toISOString() : null });
    setBusyTarget(`check-${item.id}`);

    const { error } = await supabase
      .from("wedding_checklist_items")
      .update({
        checked,
        checked_at: checked ? new Date().toISOString() : null,
      })
      .eq("id", item.id);

    setBusyTarget(null);

    if (error) {
      toast.error(error.message);
      await loadChecklist();
      return;
    }

    await loadChecklist();
  };

  const deleteChecklistItem = async (item: ChecklistItem) => {
    setBusyTarget(item.id);
    const { error } = await supabase.from("wedding_checklist_items").delete().eq("id", item.id);
    setBusyTarget(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Item deleted");
    await loadChecklist();
  };

  const moneyCards = [
    { label: "Quoted B&B Expenses", value: totals.quotedExpenses },
    { label: "Paid B&B Expenses", value: totals.paidExpenses },
    { label: "Promised Donations", value: totals.promisedDonations },
    { label: "Paid Donations", value: totals.paidDonations },
  ];

  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] animate-fade-in">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/wedding-background.jpg')" }}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.82)_30%,rgba(255,255,255,0.96)_58%,rgba(255,255,255,0.99)_100%)]" />

      <div className="space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className={cn(weddingSurface, "p-6 sm:p-8")}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-black shadow-sm">
                {activeTab === "budget" ? <Heart className="size-3.5" /> : <ListChecks className="size-3.5" />}
                {activeTab === "budget" ? "Wedding Budget" : "Wedding Checklist"}
              </div>
              <h1 className="font-wedding mt-4 text-5xl font-semibold leading-none text-black sm:text-6xl">Barend & Bianca</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/68 sm:text-base">
                Keep the planning in one place with a softer black-and-white look for this page only.
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-full border border-black/10 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("budget")}
                  className={cn(
                    "h-11 rounded-full px-5 text-sm font-semibold transition-colors",
                    activeTab === "budget" ? "bg-black text-white" : "text-black hover:bg-black/6",
                  )}
                >
                  Budget
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("checklist")}
                  className={cn(
                    "h-11 rounded-full px-5 text-sm font-semibold transition-colors",
                    activeTab === "checklist" ? "bg-black text-white" : "text-black hover:bg-black/6",
                  )}
                >
                  Checklist
                </button>
              </div>

              {activeTab === "budget" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {moneyCards.slice(0, 2).map((card) => (
                    <div key={card.label} className="rounded-[1.25rem] border border-black/12 bg-white px-4 py-3 shadow-sm">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-black/45">{card.label}</div>
                      <div className="mt-2 text-2xl font-semibold text-black">{currency.format(card.value)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {activeTab === "budget" ? loading ? (
          <div className={cn(weddingSurface, "px-6 py-10 text-center text-sm text-black/58")}>Loading wedding budget...</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {moneyCards.map((card) => (
                <section key={card.label} className={cn(weddingSurface, "p-5")}>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-black/45">{card.label}</div>
                  <div className="mt-3 text-3xl font-semibold text-black">{currency.format(card.value)}</div>
                </section>
              ))}
            </div>

            <div className="space-y-6">
              {(["barend_bianca", "others_to_pay"] as ExpenseSection[]).map((section) => (
                <ExpenseSectionCard
                  key={section}
                  title={sectionTitles[section]}
                  rows={expenses.filter((row) => row.section === section)}
                  busyTarget={busyTarget}
                  onAdd={() => addExpense(section)}
                  onDelete={deleteExpense}
                  onSave={saveExpense}
                  onUpdate={updateExpense}
                />
              ))}

              <DonationSectionCard
                rows={donations}
                busyTarget={busyTarget}
                onAdd={addDonation}
                onDelete={deleteDonation}
                onSave={saveDonation}
                onUpdate={updateDonation}
              />
            </div>
          </>
        ) : (
          <ChecklistPage
            divisions={divisions}
            items={checklistItems}
            loading={checklistLoading}
            busyTarget={busyTarget}
            onAddDivision={addDivision}
            onAddItem={addChecklistItem}
            onDeleteDivision={deleteDivision}
            onDeleteItem={deleteChecklistItem}
            onSaveDivision={saveDivision}
            onSaveItem={saveChecklistItem}
            onToggleItem={toggleChecklistItem}
            onUpdateDivision={updateDivision}
            onUpdateItem={updateChecklistItem}
          />
        )}
      </div>
    </div>
  );
}

function ChecklistPage({
  divisions,
  items,
  loading,
  busyTarget,
  onAddDivision,
  onAddItem,
  onDeleteDivision,
  onDeleteItem,
  onSaveDivision,
  onSaveItem,
  onToggleItem,
  onUpdateDivision,
  onUpdateItem,
}: {
  divisions: ChecklistDivision[];
  items: ChecklistItem[];
  loading: boolean;
  busyTarget: BusyTarget;
  onAddDivision: () => void;
  onAddItem: (divisionId: string) => void;
  onDeleteDivision: (division: ChecklistDivision) => void;
  onDeleteItem: (item: ChecklistItem) => void;
  onSaveDivision: (division: ChecklistDivision) => void;
  onSaveItem: (item: ChecklistItem) => void;
  onToggleItem: (item: ChecklistItem) => void;
  onUpdateDivision: (id: string, patch: Partial<ChecklistDivision>) => void;
  onUpdateItem: (id: string, patch: Partial<ChecklistItem>) => void;
}) {
  if (loading) {
    return <div className={cn(weddingSurface, "px-6 py-10 text-center text-sm text-black/58")}>Loading wedding checklist...</div>;
  }

  return (
    <div className="space-y-6">
      <section className={cn(weddingSurface, "p-5 sm:p-6")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-wedding text-[2rem] font-semibold leading-none text-black sm:text-[2.2rem]">Checklist</h2>
            <p className="mt-1 text-sm text-black/58">Create divisions, add item lines, and tick items off when they are done.</p>
          </div>
          <button type="button" onClick={onAddDivision} disabled={busyTarget === "add-division"} className={weddingButton}>
            <Plus size={16} />
            {busyTarget === "add-division" ? "Adding..." : "Add division"}
          </button>
        </div>
      </section>

      {divisions.length === 0 ? (
        <section className={cn(weddingSurface, "px-6 py-12 text-center")}>
          <ListChecks className="mx-auto size-10 text-black/35" />
          <div className="mt-3 text-sm font-semibold text-black">No checklist divisions yet</div>
          <p className="mt-1 text-sm text-black/52">Add your first division to start building the wedding checklist.</p>
        </section>
      ) : (
        divisions.map((division) => {
          const divisionItems = items
            .filter((item) => item.division_id === division.id)
            .sort((a, b) => Number(a.checked) - Number(b.checked) || a.sort_order - b.sort_order);

          return (
            <section key={division.id} className={cn(weddingSurface, "overflow-hidden")}>
              <div className="flex flex-col gap-3 border-b border-black/10 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <input
                    value={division.name}
                    onChange={(event) => onUpdateDivision(division.id, { name: event.target.value })}
                    className="w-full border-none bg-transparent font-wedding text-[2rem] font-semibold leading-none text-black outline-none sm:text-[2.2rem]"
                    maxLength={120}
                  />
                  <div className="text-[11px] uppercase tracking-[0.2em] text-black/42">
                    {divisionItems.filter((item) => item.checked).length} of {divisionItems.length} checked
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => onAddItem(division.id)} disabled={busyTarget === `add-item-${division.id}`} className={cn(weddingButton, "h-10 px-4 text-xs")}>
                    <Plus size={14} />
                    Add item
                  </button>
                  <button type="button" onClick={() => onSaveDivision(division)} disabled={busyTarget === division.id} className={cn(weddingButton, "h-10 px-4 text-xs")}>
                    <Save size={14} />
                    Save
                  </button>
                  <button type="button" onClick={() => onDeleteDivision(division)} disabled={busyTarget === division.id} className={cn(weddingGhostButton, "h-10 w-10")} aria-label="Delete division">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {divisionItems.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-black/48">No items in this division yet.</div>
              ) : (
                <div className="divide-y divide-black/8">
                  {divisionItems.map((item) => (
                    <ChecklistItemRow
                      key={item.id}
                      item={item}
                      busy={busyTarget === item.id || busyTarget === `check-${item.id}`}
                      onDelete={() => onDeleteItem(item)}
                      onSave={() => onSaveItem(item)}
                      onToggle={() => onToggleItem(item)}
                      onUpdate={(patch) => onUpdateItem(item.id, patch)}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}

function ChecklistItemRow({
  item,
  busy,
  onDelete,
  onSave,
  onToggle,
  onUpdate,
}: {
  item: ChecklistItem;
  busy: boolean;
  onDelete: () => void;
  onSave: () => void;
  onToggle: () => void;
  onUpdate: (patch: Partial<ChecklistItem>) => void;
}) {
  return (
    <div className={cn("grid gap-3 px-5 py-4 lg:grid-cols-[auto_1fr_auto] lg:items-center", item.checked && "bg-black/[0.045]")}>
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors lg:justify-self-start",
          item.checked
            ? "border-black bg-black text-white"
            : "border-black/18 bg-white text-black hover:bg-black hover:text-white",
        )}
      >
        {item.checked ? <CheckSquare size={16} /> : <Square size={16} />}
        Checked
      </button>

      <input
        value={item.item_text}
        onChange={(event) => onUpdate({ item_text: event.target.value })}
        className={cn(weddingField, item.checked && "text-black/48 line-through")}
        maxLength={180}
      />

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onSave} disabled={busy} className={cn(weddingButton, "h-10 px-4 text-xs")}>
          <Save size={14} />
          Save
        </button>
        <button type="button" onClick={onDelete} disabled={busy} className={cn(weddingGhostButton, "h-10 w-10")} aria-label="Delete item">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function ExpenseSectionCard({
  title,
  rows,
  busyTarget,
  onAdd,
  onDelete,
  onSave,
  onUpdate,
}: {
  title: string;
  rows: ExpenseRow[];
  busyTarget: BusyTarget;
  onAdd: () => void;
  onDelete: (row: ExpenseRow) => void;
  onSave: (row: ExpenseRow) => void;
  onUpdate: (id: string, patch: Partial<ExpenseRow>) => void;
}) {
  const sectionTotal = rows.reduce((sum, row) => sum + toMoney(row.quoted_amount), 0);
  const sectionPaid = rows.reduce((sum, row) => sum + toMoney(row.paid_amount), 0);
  const addTarget = title.startsWith("Barend") ? "add-barend_bianca" : "add-others_to_pay";

  return (
    <section className={cn(weddingSurface, "overflow-hidden p-0")}>
      <SectionHeader
        title={title}
        subtitle={`${currency.format(sectionTotal)} quoted / ${currency.format(sectionPaid)} paid`}
        addLabel="Add item"
        adding={busyTarget === addTarget}
        onAdd={onAdd}
      />
      <EditableTable
        type="expense"
        rows={rows}
        busyTarget={busyTarget}
        onDelete={onDelete}
        onSave={onSave}
        onUpdate={onUpdate}
      />
    </section>
  );
}

function DonationSectionCard({
  rows,
  busyTarget,
  onAdd,
  onDelete,
  onSave,
  onUpdate,
}: {
  rows: DonationRow[];
  busyTarget: BusyTarget;
  onAdd: () => void;
  onDelete: (row: DonationRow) => void;
  onSave: (row: DonationRow) => void;
  onUpdate: (id: string, patch: Partial<DonationRow>) => void;
}) {
  const promised = rows.reduce((sum, row) => sum + toMoney(row.quoted_amount), 0);
  const paid = rows.reduce((sum, row) => sum + toMoney(row.paid_amount), 0);

  return (
    <section className={cn(weddingSurface, "overflow-hidden p-0")}>
      <SectionHeader
        title="People to Donate"
        subtitle={`${currency.format(promised)} promised / ${currency.format(paid)} paid in`}
        addLabel="Add person"
        adding={busyTarget === "add-donation"}
        onAdd={onAdd}
      />
      <EditableTable
        type="donation"
        rows={rows}
        busyTarget={busyTarget}
        onDelete={onDelete}
        onSave={onSave}
        onUpdate={onUpdate}
      />
    </section>
  );
}

function SectionHeader({
  title,
  subtitle,
  addLabel,
  adding,
  onAdd,
}: {
  title: string;
  subtitle: string;
  addLabel: string;
  adding: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-wedding text-[2rem] font-semibold leading-none text-black sm:text-[2.2rem]">{title}</h2>
        <div className="text-[11px] uppercase tracking-[0.2em] text-black/42">{subtitle}</div>
      </div>
      <button type="button" onClick={onAdd} disabled={adding} className={cn(weddingButton, "sm:w-auto")}>
        <Plus size={16} />
        {adding ? "Adding..." : addLabel}
      </button>
    </div>
  );
}

type EditableTableProps =
  | {
      type: "expense";
      rows: ExpenseRow[];
      busyTarget: BusyTarget;
      onDelete: (row: ExpenseRow) => void;
      onSave: (row: ExpenseRow) => void;
      onUpdate: (id: string, patch: Partial<ExpenseRow>) => void;
    }
  | {
      type: "donation";
      rows: DonationRow[];
      busyTarget: BusyTarget;
      onDelete: (row: DonationRow) => void;
      onSave: (row: DonationRow) => void;
      onUpdate: (id: string, patch: Partial<DonationRow>) => void;
    };

function EditableTable(props: EditableTableProps) {
  if (props.rows.length === 0) {
    return <div className="px-5 py-10 text-center text-sm text-black/48">No rows yet.</div>;
  }

  const isExpenseTable = props.type === "expense";

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-black/8 hover:bg-transparent">
            <TableHead className="min-w-[220px] text-black/56">{isExpenseTable ? "Item" : "Name"}</TableHead>
            <TableHead className="min-w-[140px] text-black/56">{isExpenseTable ? "Quoted" : "Amount Promised"}</TableHead>
            <TableHead className="min-w-[140px] text-black/56">{isExpenseTable ? "Paid" : "Paid In"}</TableHead>
            <TableHead className="min-w-[220px] text-black/56">Note</TableHead>
            <TableHead className="w-[140px] text-right text-black/56">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isExpenseTable
            ? props.rows.map((row) => {
                const isBusy = props.busyTarget === row.id;

                return (
                  <TableRow key={row.id} className={cn("border-black/6", isBusy && "opacity-60")}>
                    <TableCell>
                      <input
                        value={row.item_name}
                        onChange={(event) => props.onUpdate(row.id, { item_name: event.target.value })}
                        maxLength={140}
                        className={weddingField}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={toMoney(row.quoted_amount)}
                        onChange={(event) => props.onUpdate(row.id, { quoted_amount: toMoney(event.target.value) })}
                        className={cn(weddingField, "font-mono")}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={toMoney(row.paid_amount)}
                        onChange={(event) => props.onUpdate(row.id, { paid_amount: toMoney(event.target.value) })}
                        className={cn(weddingField, "font-mono")}
                      />
                    </TableCell>
                    <TableCell>
                      <textarea
                        value={row.note ?? ""}
                        onChange={(event) => props.onUpdate(row.id, { note: event.target.value })}
                        className={weddingTextareaField}
                        maxLength={240}
                      />
                    </TableCell>
                    <TableCell>
                      <RowActions isBusy={isBusy} onDelete={() => props.onDelete(row)} onSave={() => props.onSave(row)} />
                    </TableCell>
                  </TableRow>
                );
              })
            : props.rows.map((row) => {
                const isBusy = props.busyTarget === row.id;

                return (
                  <TableRow key={row.id} className={cn("border-black/6", isBusy && "opacity-60")}>
                    <TableCell>
                      <input
                        value={row.person_name}
                        onChange={(event) => props.onUpdate(row.id, { person_name: event.target.value })}
                        maxLength={140}
                        className={weddingField}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={toMoney(row.quoted_amount)}
                        onChange={(event) => props.onUpdate(row.id, { quoted_amount: toMoney(event.target.value) })}
                        className={cn(weddingField, "font-mono")}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={toMoney(row.paid_amount)}
                        onChange={(event) => props.onUpdate(row.id, { paid_amount: toMoney(event.target.value) })}
                        className={cn(weddingField, "font-mono")}
                      />
                    </TableCell>
                    <TableCell>
                      <textarea
                        value={row.note ?? ""}
                        onChange={(event) => props.onUpdate(row.id, { note: event.target.value })}
                        className={weddingTextareaField}
                        maxLength={240}
                      />
                    </TableCell>
                    <TableCell>
                      <RowActions isBusy={isBusy} onDelete={() => props.onDelete(row)} onSave={() => props.onSave(row)} />
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </div>
  );
}

function RowActions({
  isBusy,
  onDelete,
  onSave,
}: {
  isBusy: boolean;
  onDelete: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onSave} disabled={isBusy} className={cn(weddingButton, "h-9 px-4 text-xs")}>
        {isBusy ? <Check size={14} /> : <Save size={14} />}
        Save
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isBusy}
        className={weddingGhostButton}
        aria-label="Delete row"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
