import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, Download, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HistoryRecord {
  id: string;
  action: string;
  created_at: string;
  notes: string | null;
  asset: { code: string; name: string };
  performer: { display_name: string } | null;
  to_user: { display_name: string } | null;
}

export default function History() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [q, setQ] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);

  const load = async () => {
    setLoading(true);
    const [{ data: hist }, { data: p }] = await Promise.all([
      supabase
        .from("asset_history")
        .select(`
          id, action, created_at, notes,
          asset:assets(code, name),
          performer:profiles!asset_history_performed_by_fkey(display_name),
          to_user:profiles!asset_history_to_user_fkey(display_name)
        `)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, display_name").order("display_name")
    ]);

    setHistory((hist as any) ?? []);
    setUsers((p ?? []).map(u => ({ id: u.id, name: u.display_name })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = history.filter(h => {
    const matchesQ = !q || 
      h.asset.code.toLowerCase().includes(q.toLowerCase()) || 
      h.asset.name.toLowerCase().includes(q.toLowerCase());
    
    const matchesUser = userFilter === "all" || 
      h.performer?.display_name === userFilter || 
      h.to_user?.display_name === userFilter;

    const date = new Date(h.created_at);
    const matchesFrom = !dateFrom || date >= new Date(dateFrom);
    const matchesTo = !dateTo || date <= new Date(dateTo + "T23:59:59");

    return matchesQ && matchesUser && matchesFrom && matchesTo;
  });

  const exportCSV = () => {
    if (filtered.length === 0) return toast.error("No data to export");
    
    const headers = ["Date", "Asset Code", "Asset Name", "Action", "Performed By", "Recipient", "Notes"];
    const rows = filtered.map(h => [
      new Date(h.created_at).toLocaleString(),
      h.asset.code,
      h.asset.name,
      h.action.toUpperCase(),
      h.performer?.display_name ?? "System",
      h.to_user?.display_name ?? "—",
      h.notes ?? ""
    ]);

    const csvContent = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `asset-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    toast.success("CSV exported successfully");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-primary glow flex items-center gap-2">
            <span className="text-primary/60">$</span> ASSET HISTORY
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 uppercase tracking-wider">
            // tracking all movements and actions
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 font-mono text-xs uppercase tracking-widest">
          <Download size={16} className="mr-2" /> Export CSV
        </Button>
      </div>

      <Card className="bg-card/40 border-primary/30 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
            <Input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Asset Code / Name..." 
              className="pl-9 font-mono text-sm"
            />
          </div>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="font-mono text-sm">
              <SelectValue placeholder="Filter by User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Start</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
              <Input 
                type="date" 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)} 
                className="pl-9 font-mono text-sm"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground ml-1">End</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
              <Input 
                type="date" 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)} 
                className="pl-9 font-mono text-sm"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="rounded border border-primary/30 bg-card/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-primary/30 text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal">Asset</th>
                <th className="px-4 py-3 font-normal">Action</th>
                <th className="px-4 py-3 font-normal">Performed By</th>
                <th className="px-4 py-3 font-normal">Recipient</th>
                <th className="px-4 py-3 font-normal">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-primary/70 animate-pulse">// LOADING DATA...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground/70">// NO RECORDS FOUND</td></tr>
              ) : (
                filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground tabular-nums text-xs whitespace-nowrap">
                      {new Date(h.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-primary glow-soft">{h.asset.code}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{h.asset.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-[10px] uppercase tracking-widest border px-1.5 py-0.5 rounded",
                        h.action === "signed_out" ? "border-yellow-500/50 text-yellow-400" :
                        h.action === "signed_in" ? "border-primary/50 text-primary" :
                        "border-muted-foreground/50 text-muted-foreground"
                      )}>
                        {h.action.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground/80">{h.performer?.display_name ?? "System"}</td>
                    <td className="px-4 py-3 text-foreground/80">{h.to_user?.display_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs italic truncate max-w-[200px]" title={h.notes ?? ""}>
                      {h.notes ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
