"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, StatCard, BtnPrimary, BtnOutline, SearchInput, Pagination, EmptyState, TableSkeleton, Modal } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { inputStyle } from "@/config/dashboard";
import { DollarSign, Plus, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";

function formatEGP(n: number) { return n.toLocaleString("en-EG") + " EGP"; }

const EMPTY: any = { date: new Date().toISOString().slice(0, 10), account: "", description: "", debit: "", credit: "", category: "operations" };

export default function AccountingPage() {
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const perPage = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounting").then(r => r.json());
      setEntries(res.success ? res.data : []);
    } catch { show("Failed to load entries", "danger"); }
    setLoading(false);
  }, [show]);

  useEffect(() => { load(); }, [load]);

  const filtered = entries.filter(e =>
    [e.description, e.account, e.category].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalDebit = entries.reduce((s, e) => s + Number(e.debit || 0), 0);
  const totalCredit = entries.reduce((s, e) => s + Number(e.credit || 0), 0);

  async function save() {
    try {
      const res = await fetch("/api/accounting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, debit: Number(form.debit) || 0, credit: Number(form.credit) || 0 }),
      });
      const json = await res.json();
      if (json.success) { show("Entry added", "success"); setModal(false); setForm({ ...EMPTY }); load(); }
      else show(json.error || "Failed", "danger");
    } catch { show("Network error", "danger"); }
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <h1 className="text-[1.6rem] font-bold flex items-center gap-2"><DollarSign size={24} style={{ color: "var(--brand)" }} /> Accounting</h1>
        <BtnPrimary onClick={() => { setForm({ ...EMPTY }); setModal(true); }}><Plus size={14} /> New Entry</BtnPrimary>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-5">
        <StatCard label="Total Debits" value={formatEGP(totalDebit)} icon={<TrendingDown size={20} />} valueColor="var(--danger)" />
        <StatCard label="Total Credits" value={formatEGP(totalCredit)} icon={<TrendingUp size={20} />} valueColor="var(--success)" />
        <StatCard label="Net Balance" value={formatEGP(totalCredit - totalDebit)} icon={<ArrowUpDown size={20} />} valueColor={totalCredit - totalDebit >= 0 ? "var(--success)" : "var(--danger)"} />
      </div>

      {/* simple bar chart */}
      <Card>
        <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-[.95rem] font-bold">Monthly Overview</h2>
        </div>
        <div className="p-4 flex items-end gap-2 h-40 overflow-x-auto">
          {(() => {
            const byMonth: Record<string, { d: number; c: number }> = {};
            entries.forEach(e => { const m = (e.date || "").slice(0, 7); if (!byMonth[m]) byMonth[m] = { d: 0, c: 0 }; byMonth[m].d += Number(e.debit || 0); byMonth[m].c += Number(e.credit || 0); });
            const months = Object.keys(byMonth).sort().slice(-6);
            const max = Math.max(1, ...months.map(m => Math.max(byMonth[m].d, byMonth[m].c)));
            return months.map(m => (
              <div key={m} className="flex flex-col items-center gap-1 flex-1 min-w-[40px]">
                <div className="flex gap-1 items-end w-full justify-center" style={{ height: 100 }}>
                  <div style={{ width: 14, height: (byMonth[m].d / max) * 100, background: "var(--danger)", borderRadius: 3, opacity: .7 }} title={`Debit: ${formatEGP(byMonth[m].d)}`} />
                  <div style={{ width: 14, height: (byMonth[m].c / max) * 100, background: "var(--success)", borderRadius: 3, opacity: .7 }} title={`Credit: ${formatEGP(byMonth[m].c)}`} />
                </div>
                <span className="text-[.62rem]" style={{ color: "var(--fg-muted)" }}>{m.slice(5)}</span>
              </div>
            ));
          })()}
        </div>
      </Card>

      <div className="mt-4 mb-4"><SearchInput value={search} onChange={setSearch} placeholder="Search entries…" /></div>

      {loading ? <TableSkeleton rows={8} cols={6} /> : filtered.length === 0 ? <EmptyState title="No entries" description="Add your first accounting entry" /> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-[.82rem]">
              <thead><tr style={{ background: "var(--bg)" }}>
                {["Date", "Account", "Description", "Category", "Debit", "Credit"].map(h => (
                  <th key={h} className="p-3 text-left text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {paged.map(e => (
                  <tr key={e.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="p-3 whitespace-nowrap">{e.date?.slice(0, 10)}</td>
                    <td className="p-3 font-medium">{e.account}</td>
                    <td className="p-3">{e.description}</td>
                    <td className="p-3 capitalize">{e.category}</td>
                    <td className="p-3" style={{ color: e.debit > 0 ? "var(--danger)" : undefined }}>{e.debit > 0 ? formatEGP(e.debit) : "—"}</td>
                    <td className="p-3" style={{ color: e.credit > 0 ? "var(--success)" : undefined }}>{e.credit > 0 ? formatEGP(e.credit) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}><Pagination current={page} total={totalPages} onChange={setPage} /></div>}
        </Card>
      )}

      {modal && (
        <Modal title="New Accounting Entry" onClose={() => setModal(false)}>
          <div className="space-y-3">
            {[["date", "Date", "date"], ["account", "Account", "text"], ["description", "Description", "text"], ["debit", "Debit (EGP)", "number"], ["credit", "Credit (EGP)", "number"]].map(([k, l, t]) => (
              <div key={k}><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>{l}</label>
                <input type={t} style={inputStyle} className="w-full" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
            <div><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Category</label>
              <select style={inputStyle} className="w-full" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {["operations", "fuel", "maintenance", "salary", "revenue", "toll", "insurance", "other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-2"><BtnPrimary onClick={save}>Add Entry</BtnPrimary><BtnOutline onClick={() => setModal(false)}>Cancel</BtnOutline></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
