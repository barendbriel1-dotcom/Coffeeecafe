import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Heart, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type ExpenseRow = Tables<"wedding_expenses">;
type DonationRow = Tables<"wedding_donations">;
type ExpenseSection = "barend_bianca" | "others_to_pay";
type BusyTarget = string | null;

const sectionTitles: Record<ExpenseSection, string> = {
  barend_bianca: "Barend & Bianca Expenses",
  others_to_pay: "Others to pay",
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

export default function Wedding() {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(true);
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

  const totals = useMemo(() => {
    const quotedExpenses = expenses.reduce((sum, row) => sum + toMoney(row.quoted_amount), 0);
    const paidExpenses = expenses.reduce((sum, row) => sum + toMoney(row.paid_amount), 0);
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

  const moneyCards = [
    { label: "Quoted expenses", value: totals.quotedExpenses },
    { label: "Paid expenses", value: totals.paidExpenses },
    { label: "Promised donations", value: totals.promisedDonations },
    { label: "Paid donations", value: totals.paidDonations },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="app-kicker">Wedding budget</div>
          <h1 className="app-title flex items-center gap-3">
            <Heart className="size-8 text-primary" />
            Barend & Bianca
          </h1>
          <p className="app-subtitle mt-2">Track quoted amounts, paid amounts, and the people contributing to the wedding.</p>
        </div>
      </section>

      {loading ? (
        <Card className="app-panel p-6 text-sm text-muted-foreground">Loading wedding budget...</Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {moneyCards.map((card) => (
              <Card key={card.label} className="app-panel p-5">
                <div className="app-kicker">{card.label}</div>
                <div className="mt-3 font-display text-3xl font-semibold text-foreground glow-soft">{currency.format(card.value)}</div>
              </Card>
            ))}
          </div>

          <div className="space-y-5">
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
      )}
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
    <Card className="app-panel overflow-hidden p-0">
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
    </Card>
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
    <Card className="app-panel overflow-hidden p-0">
      <SectionHeader
        title="People to donate"
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
    </Card>
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
    <div className="flex flex-col gap-3 border-b border-primary/14 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div>
        <h2 className="font-display text-2xl text-foreground glow-soft">{title}</h2>
        <div className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">{subtitle}</div>
      </div>
      <Button type="button" onClick={onAdd} disabled={adding} className="gap-2 sm:w-auto">
        <Plus size={16} />
        {adding ? "Adding..." : addLabel}
      </Button>
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
    return <div className="px-5 py-10 text-center text-sm text-muted-foreground">No rows yet.</div>;
  }

  const isExpenseTable = props.type === "expense";

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="min-w-[220px]">{isExpenseTable ? "Item" : "Name"}</TableHead>
          <TableHead className="min-w-[140px]">{isExpenseTable ? "Quoted" : "Amount promised"}</TableHead>
          <TableHead className="min-w-[140px]">{isExpenseTable ? "Paid" : "Paid in"}</TableHead>
          <TableHead className="min-w-[220px]">Note</TableHead>
          <TableHead className="w-[140px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isExpenseTable
          ? props.rows.map((row) => {
              const isBusy = props.busyTarget === row.id;

              return (
                <TableRow key={row.id} className={cn(isBusy && "opacity-60")}>
                  <TableCell>
                    <Input value={row.item_name} onChange={(event) => props.onUpdate(row.id, { item_name: event.target.value })} maxLength={140} />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={toMoney(row.quoted_amount)}
                      onChange={(event) => props.onUpdate(row.id, { quoted_amount: toMoney(event.target.value) })}
                      className="font-mono"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={toMoney(row.paid_amount)}
                      onChange={(event) => props.onUpdate(row.id, { paid_amount: toMoney(event.target.value) })}
                      className="font-mono"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={row.note ?? ""}
                      onChange={(event) => props.onUpdate(row.id, { note: event.target.value })}
                      className="min-h-[44px] rounded-[1.2rem] py-2"
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
                <TableRow key={row.id} className={cn(isBusy && "opacity-60")}>
                  <TableCell>
                    <Input value={row.person_name} onChange={(event) => props.onUpdate(row.id, { person_name: event.target.value })} maxLength={140} />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={toMoney(row.quoted_amount)}
                      onChange={(event) => props.onUpdate(row.id, { quoted_amount: toMoney(event.target.value) })}
                      className="font-mono"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={toMoney(row.paid_amount)}
                      onChange={(event) => props.onUpdate(row.id, { paid_amount: toMoney(event.target.value) })}
                      className="font-mono"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={row.note ?? ""}
                      onChange={(event) => props.onUpdate(row.id, { note: event.target.value })}
                      className="min-h-[44px] rounded-[1.2rem] py-2"
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
      <Button type="button" size="sm" onClick={onSave} disabled={isBusy} className="gap-1.5">
        {isBusy ? <Check size={14} /> : <Save size={14} />}
        Save
      </Button>
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={onDelete}
        disabled={isBusy}
        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        aria-label="Delete row"
      >
        <Trash2 size={15} />
      </Button>
    </div>
  );
}
