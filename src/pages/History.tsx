import { useEffect, useMemo, useState } from "react";
import { Calendar, Download, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportDamageReportPdf } from "@/lib/pdf";
import { Shield, AlertTriangle, FileText } from "lucide-react";

interface HistoryRecord {
  id: string;
  action: string;
  created_at: string;
  notes: string | null;
  performed_by: string | null;
  from_user: string | null;
  to_user: string | null;
  asset: { code: string; name: string; serial_number: string | null };
}

export default function History() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [damageReports, setDamageReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("logs");

  const load = async () => {
    setLoading(true);

    const [{ data: historyRows }, { data: profileRows }, { data: drRows }] = await Promise.all([
      supabase
        .from("asset_history")
        .select(`
          id, action, created_at, notes, performed_by, from_user, to_user,
          asset:assets(code, name, serial_number)
        `)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, display_name").order("display_name"),
      supabase
        .from("damage_reports")
        .select("*")
        .not("admin_conclusion_status", "is", null)
        .order("created_at", { ascending: false })
    ]);

    const profiles = Object.fromEntries((profileRows ?? []).map((profile) => [profile.id, profile.display_name]));
    setHistory((historyRows as any) ?? []);
    setDamageReports(drRows ?? []);
    setUsers((profileRows ?? []).map((profile) => ({ id: profile.id, name: profile.display_name })));
    setUserMap(profiles);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return history.filter((row) => {
      const searchBlob = [
        row.asset.code,
        row.asset.name,
        row.asset.serial_number ?? "",
        row.action,
        userMap[row.performed_by ?? ""] ?? "",
        userMap[row.from_user ?? ""] ?? "",
        userMap[row.to_user ?? ""] ?? "",
        row.notes ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !q.trim() || searchBlob.includes(q.trim().toLowerCase());
      const matchesUser =
        userFilter === "all" ||
        row.performed_by === userFilter ||
        row.from_user === userFilter ||
        row.to_user === userFilter;

      const date = new Date(row.created_at);
      const matchesFrom = !dateFrom || date >= new Date(dateFrom);
      const matchesTo = !dateTo || date <= new Date(`${dateTo}T23:59:59`);
      return matchesQuery && matchesUser && matchesFrom && matchesTo;
    });
  }, [dateFrom, dateTo, history, q, userFilter, userMap]);

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.error("No history data to export.");
      return;
    }

    const headers = ["Date", "Asset Code", "Asset Name", "Action", "Performed By", "Used By", "Issued To", "Notes"];
    const rows = filtered.map((row) => [
      new Date(row.created_at).toLocaleString(),
      row.asset.code,
      row.asset.name,
      row.action.toUpperCase(),
      userMap[row.performed_by ?? ""] || "System",
      userMap[row.from_user ?? ""] || "-",
      userMap[row.to_user ?? ""] || "-",
      row.notes ?? "",
    ]);

    const csvContent = [headers, ...rows].map((entry) => entry.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `asset-history-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully.");
  };

  const filteredDamageReports = useMemo(() => {
    return damageReports.filter((report) => {
      const searchBlob = [
        report.asset_code,
        report.asset_name,
        report.damage_type ?? "",
        report.description ?? "",
        report.admin_conclusion_notes ?? "",
        userMap[report.assigned_to] ?? "",
        userMap[report.reported_by] ?? "",
      ].join(" ").toLowerCase();

      const matchesQuery = !q.trim() || searchBlob.includes(q.trim().toLowerCase());
      const matchesUser = userFilter === "all" || report.assigned_to === userFilter || report.reported_by === userFilter;
      
      const date = new Date(report.created_at);
      const matchesFrom = !dateFrom || date >= new Date(dateFrom);
      const matchesTo = !dateTo || date <= new Date(`${dateTo}T23:59:59`);
      
      return matchesQuery && matchesUser && matchesFrom && matchesTo;
    });
  }, [q, userFilter, dateFrom, dateTo, damageReports, userMap]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="font-display text-3xl text-foreground glow-soft">History</h1>
        </div>

        <Button onClick={exportCSV} variant="outline">
          <Download size={16} className="mr-2" /> Export CSV
        </Button>
      </div>

      <Card className="bg-card/40 p-4">
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
              <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Asset, user, action, notes..." className="pl-9" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">User</Label>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger><SelectValue placeholder="All users" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Start date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-muted-foreground" size={16} />
              <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="pl-9 calendar-icon-green" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">End date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-muted-foreground" size={16} />
              <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="pl-9 calendar-icon-green" />
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card/40 border border-primary/20 mb-4">
          <TabsTrigger value="logs" className="gap-2">
            <Shield size={14} /> Operation Logs
          </TabsTrigger>
          <TabsTrigger value="damage" className="gap-2">
            <AlertTriangle size={14} /> Damage Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <div className="app-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary/12 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    <th className="px-4 py-3 font-normal">Date</th>
                    <th className="px-4 py-3 font-normal">Asset</th>
                    <th className="px-4 py-3 font-normal">Action</th>
                    <th className="px-4 py-3 font-normal">Performed By</th>
                    <th className="px-4 py-3 font-normal">Used By</th>
                    <th className="px-4 py-3 font-normal">Issued To</th>
                    <th className="px-4 py-3 font-normal">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-primary/70">Loading history...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground/70">No history records found.</td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr key={row.id} className="transition-colors hover:bg-primary/5">
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                          {new Date(row.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-display text-foreground glow-soft">{row.asset.code}</div>
                          <div className="max-w-[180px] truncate text-[11px] text-muted-foreground">{row.asset.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]",
                              row.action === "signed_out"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                : row.action === "signed_in"
                                  ? "border-primary/30 bg-primary/10 text-primary"
                                  : row.action === "sent_for_repairs"
                                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                                    : row.action === "marked_damaged"
                                      ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                                      : "border-primary/16 bg-card/70 text-muted-foreground",
                            )}
                          >
                            {row.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground/85">{userMap[row.performed_by ?? ""] || "System"}</td>
                        <td className="px-4 py-3 text-foreground/85">{userMap[row.from_user ?? ""] || "-"}</td>
                        <td className="px-4 py-3 text-foreground/85">{userMap[row.to_user ?? ""] || "-"}</td>
                        <td className="max-w-[260px] truncate px-4 py-3 text-xs italic text-muted-foreground" title={row.notes ?? ""}>
                          {row.notes ?? "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="damage">
          <div className="app-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary/12 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    <th className="px-4 py-3 font-normal">Date</th>
                    <th className="px-4 py-3 font-normal">Asset</th>
                    <th className="px-4 py-3 font-normal">Type</th>
                    <th className="px-4 py-3 font-normal">Resolution</th>
                    <th className="px-4 py-3 font-normal">Reported By</th>
                    <th className="px-4 py-3 font-normal text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-primary/70">Loading reports...</td>
                    </tr>
                  ) : filteredDamageReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground/70">No completed damage reports found.</td>
                    </tr>
                  ) : (
                    filteredDamageReports.map((report) => (
                      <tr key={report.id} className="transition-colors hover:bg-primary/5">
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-display text-foreground">{report.asset_code}</div>
                          <div className="max-w-[180px] truncate text-[11px] text-muted-foreground">{report.asset_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="border-rose-500/30 text-rose-300 font-mono text-[9px] uppercase">
                            {report.damage_type || "GENERAL"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="border-primary/30 text-primary font-mono text-[9px] uppercase">
                            {report.admin_conclusion_status?.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-foreground/85">{userMap[report.reported_by] || "Unknown"}</td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
                            onClick={() => exportDamageReportPdf(report, userMap)}
                          >
                            <FileText size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
