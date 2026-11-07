"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, BtnPrimary, BtnOutline, SearchInput, Pagination, EmptyState, TableSkeleton, Modal } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { inputStyle } from "@/config/dashboard";
import { HeadphonesIcon, Plus, MessageSquare, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const statusColors: Record<string, { bg: string; fg: string }> = {
  open: { bg: "var(--amber-light)", fg: "var(--amber)" },
  in_progress: { bg: "var(--blue-light, #e8f4fd)", fg: "var(--blue, #2563eb)" },
  resolved: { bg: "var(--success-light)", fg: "var(--success)" },
  closed: { bg: "var(--bg)", fg: "var(--fg-muted)" },
};

const priorityColors: Record<string, { bg: string; fg: string }> = {
  low: { bg: "var(--bg)", fg: "var(--fg-muted)" },
  medium: { bg: "var(--amber-light)", fg: "var(--amber)" },
  high: { bg: "var(--danger-light, #fee)", fg: "var(--danger)" },
  urgent: { bg: "var(--danger-light, #fee)", fg: "var(--danger)" },
};

function StatusPill({ status }: { status: string }) {
  const c = statusColors[status] || { bg: "var(--bg)", fg: "var(--fg-muted)" };
  return <span className="inline-flex rounded-full px-2.5 py-1 text-[.68rem] font-semibold capitalize" style={{ background: c.bg, color: c.fg }}>{status.replace(/_/g, " ")}</span>;
}

function PriorityPill({ priority }: { priority: string }) {
  const c = priorityColors[priority] || { bg: "var(--bg)", fg: "var(--fg-muted)" };
  return <span className="inline-flex rounded-full px-2 py-0.5 text-[.65rem] font-semibold capitalize" style={{ background: c.bg, color: c.fg }}>{priority}</span>;
}

const EMPTY: any = { subject: "", description: "", category: "general", priority: "medium", reporter_name: "", reporter_role: "passenger" };

export default function SupportPage() {
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | "add" | "view">(null);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [selected, setSelected] = useState<any>(null);
  const perPage = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support").then(r => r.json());
      setTickets(res.success ? res.data : []);
    } catch { show("Failed to load tickets", "danger"); }
    setLoading(false);
  }, [show]);

  useEffect(() => { load(); }, [load]);

  const filtered = tickets.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return [t.subject, t.reporter_name, t.category].some(v => v?.toLowerCase().includes(search.toLowerCase()));
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  async function save() {
    try {
      const res = await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) { show("Ticket created", "success"); setModal(null); setForm({ ...EMPTY }); load(); }
      else show(json.error || "Failed", "danger");
    } catch { show("Network error", "danger"); }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/support/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const json = await res.json();
      if (json.success) { show(`Ticket ${status.replace(/_/g, " ")}`, "success"); load(); }
      else show(json.error || "Failed", "danger");
    } catch { show("Network error", "danger"); }
  }

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <h1 className="text-[1.6rem] font-bold flex items-center gap-2"><HeadphonesIcon size={24} style={{ color: "var(--brand)" }} /> Support Tickets</h1>
        <BtnPrimary onClick={() => { setForm({ ...EMPTY }); setModal("add"); }}><Plus size={14} /> New Ticket</BtnPrimary>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3 mb-5">
        {[
          { label: "Open", count: openCount, icon: <AlertTriangle size={16} />, color: "var(--amber)" },
          { label: "In Progress", count: inProgressCount, icon: <Clock size={16} />, color: "var(--blue, #2563eb)" },
          { label: "Resolved", count: tickets.filter(t => t.status === "resolved").length, icon: <CheckCircle size={16} />, color: "var(--success)" },
          { label: "Total", count: tickets.length, icon: <MessageSquare size={16} />, color: "var(--brand)" },
        ].map(s => (
          <Card key={s.label}>
            <div className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
              <div><div className="text-[1.1rem] font-bold">{s.count}</div><div className="text-[.68rem]" style={{ color: "var(--fg-muted)" }}>{s.label}</div></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search tickets…" />
        <select style={inputStyle} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Status</option>
          {["open", "in_progress", "resolved", "closed"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {loading ? <TableSkeleton rows={5} cols={6} /> : filtered.length === 0 ? <EmptyState title="No tickets" description="No support tickets found" /> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-[.82rem]">
              <thead><tr style={{ background: "var(--bg)" }}>
                {["Subject", "Reporter", "Category", "Priority", "Status", "Created", "Actions"].map(h => (
                  <th key={h} className="p-3 text-left text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {paged.map(t => (
                  <tr key={t.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="p-3 font-medium max-w-[200px] truncate">{t.subject}</td>
                    <td className="p-3">{t.reporter_name || "—"}</td>
                    <td className="p-3 capitalize">{t.category}</td>
                    <td className="p-3"><PriorityPill priority={t.priority} /></td>
                    <td className="p-3"><StatusPill status={t.status} /></td>
                    <td className="p-3 whitespace-nowrap text-[.72rem]">{new Date(t.created_at).toLocaleDateString("en-EG")}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setSelected(t); setModal("view"); }} className="p-1.5 rounded text-[.72rem] font-semibold" style={{ color: "var(--brand)" }}>View</button>
                        {t.status === "open" && <button onClick={() => updateStatus(t.id, "in_progress")} className="p-1.5 rounded text-[.72rem]" style={{ color: "var(--blue, #2563eb)" }}>Start</button>}
                        {t.status === "in_progress" && <button onClick={() => updateStatus(t.id, "resolved")} className="p-1.5 rounded text-[.72rem]" style={{ color: "var(--success)" }}>Resolve</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}><Pagination current={page} total={totalPages} onChange={setPage} /></div>}
        </Card>
      )}

      {modal === "view" && selected && (
        <Modal title={`Ticket: ${selected.subject}`} onClose={() => setModal(null)} wide>
          <div className="space-y-4 text-[.82rem]">
            <div className="flex gap-2"><StatusPill status={selected.status} /><PriorityPill priority={selected.priority} /></div>
            <div className="p-3 rounded-lg" style={{ background: "var(--bg)" }}>
              <p>{selected.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["Reporter", selected.reporter_name], ["Role", selected.reporter_role], ["Category", selected.category], ["Created", new Date(selected.created_at).toLocaleString("en-EG")]].map(([l, v]) => (
                <div key={l as string}><span className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>{l}</span><div className="font-medium">{v || "—"}</div></div>
              ))}
            </div>
            {selected.resolution && <div><span className="text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>Resolution</span><p className="mt-1 p-3 rounded-lg" style={{ background: "var(--success-light)" }}>{selected.resolution}</p></div>}
            <div className="flex gap-2 pt-2">
              {selected.status === "open" && <BtnPrimary onClick={() => { updateStatus(selected.id, "in_progress"); setModal(null); }}>Start Working</BtnPrimary>}
              {selected.status === "in_progress" && <BtnPrimary onClick={() => { updateStatus(selected.id, "resolved"); setModal(null); }}>Mark Resolved</BtnPrimary>}
              {selected.status === "resolved" && <BtnPrimary onClick={() => { updateStatus(selected.id, "closed"); setModal(null); }}>Close Ticket</BtnPrimary>}
              <BtnOutline onClick={() => setModal(null)}>Close</BtnOutline>
            </div>
          </div>
        </Modal>
      )}

      {modal === "add" && (
        <Modal title="New Support Ticket" onClose={() => setModal(null)}>
          <div className="space-y-3">
            {[["subject", "Subject"], ["reporter_name", "Reporter Name"]].map(([k, l]) => (
              <div key={k}><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>{l}</label>
                <input style={inputStyle} className="w-full" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
            <div><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Description</label>
              <textarea style={inputStyle} className="w-full" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Category</label>
                <select style={inputStyle} className="w-full" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {["general", "booking", "payment", "driver", "vehicle", "route", "technical"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Priority</label>
                <select style={inputStyle} className="w-full" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {["low", "medium", "high", "urgent"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2"><BtnPrimary onClick={save}>Create Ticket</BtnPrimary><BtnOutline onClick={() => setModal(null)}>Cancel</BtnOutline></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
