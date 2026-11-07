"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, BtnPrimary, BtnOutline, BtnDanger, SearchInput, Pagination, EmptyState, TableSkeleton, Modal } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { inputStyle } from "@/config/dashboard";
import { Building2, Plus, Edit3, Trash2, Eye } from "lucide-react";

function formatEGP(n: number) { return n.toLocaleString("en-EG") + " EGP"; }

const statusColors: Record<string, { bg: string; fg: string }> = {
  active: { bg: "var(--success-light)", fg: "var(--success)" },
  inactive: { bg: "var(--danger-light, #fee)", fg: "var(--danger)" },
  prospect: { bg: "var(--amber-light)", fg: "var(--amber)" },
};

function StatusPill({ status }: { status: string }) {
  const c = statusColors[status] || { bg: "var(--bg)", fg: "var(--fg-muted)" };
  return <span className="inline-flex rounded-full px-2.5 py-1 text-[.68rem] font-semibold capitalize" style={{ background: c.bg, color: c.fg }}>{status}</span>;
}

const EMPTY: any = { company_name: "", contact_name: "", contact_email: "", contact_phone: "", address: "", contract_type: "", monthly_budget: "", status: "prospect" };

export default function B2BPage() {
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | "add" | "edit" | "view">(null);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [selected, setSelected] = useState<any>(null);
  const perPage = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/b2b-clients").then(r => r.json());
      setClients(res.success ? res.data : []);
    } catch { show("Failed to load B2B clients", "danger"); }
    setLoading(false);
  }, [show]);

  useEffect(() => { load(); }, [load]);

  const filtered = clients.filter(c =>
    [c.company_name, c.contact_name, c.contact_email].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  async function save() {
    const method = modal === "edit" ? "PATCH" : "POST";
    const url = modal === "edit" ? `/api/b2b-clients?id=${selected.id}` : "/api/b2b-clients";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, monthly_budget: Number(form.monthly_budget) || 0 }) });
      const json = await res.json();
      if (json.success) { show(modal === "edit" ? "Client updated" : "Client created", "success"); setModal(null); load(); }
      else show(json.error || "Failed", "danger");
    } catch { show("Network error", "danger"); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this client?")) return;
    try {
      const res = await fetch(`/api/b2b-clients?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { show("Client deleted", "success"); load(); } else show(json.error || "Failed", "danger");
    } catch { show("Network error", "danger"); }
  }

  function openEdit(c: any) {
    setSelected(c);
    setForm({ company_name: c.company_name, contact_name: c.contact_name, contact_email: c.contact_email, contact_phone: c.contact_phone, address: c.address || "", contract_type: c.contract_type || "", monthly_budget: c.monthly_budget || "", status: c.status });
    setModal("edit");
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <h1 className="text-[1.6rem] font-bold flex items-center gap-2"><Building2 size={24} style={{ color: "var(--brand)" }} /> B2B Clients</h1>
        {/* <BtnPrimary onClick={() => { setForm({ ...EMPTY }); setModal("add"); }}><Plus size={14} /> New Client</BtnPrimary> */}
      </div>

      <div className="mb-4"><SearchInput value={search} onChange={setSearch} placeholder="Search company or contact…" /></div>

      {loading ? <TableSkeleton rows={5} cols={6} /> : filtered.length === 0 ? <EmptyState title="No B2B clients" description="Add your first corporate client" /> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-[.82rem]">
              <thead><tr style={{ background: "var(--bg)" }}>
                {["Company", "Contact", "Email", "Budget", "Status", "Actions"].map(h => (
                  <th key={h} className="p-3 text-left text-[.72rem] font-semibold" style={{ color: "var(--fg-muted)" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {paged.map(c => (
                  <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="p-3 font-medium">{c.company_name}</td>
                    <td className="p-3">{c.contact_name}</td>
                    <td className="p-3">{c.contact_email}</td>
                    <td className="p-3">{c.monthly_budget ? formatEGP(c.monthly_budget) : "—"}</td>
                    <td className="p-3"><StatusPill status={c.status} /></td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setSelected(c); setModal("view"); }} className="p-1.5 rounded" style={{ color: "var(--brand)" }}><Eye size={14} /></button>
                        {/* <button onClick={() => openEdit(c)} className="p-1.5 rounded" style={{ color: "var(--amber)" }}><Edit3 size={14} /></button> */}
                        {/* <button onClick={() => remove(c.id)} className="p-1.5 rounded" style={{ color: "var(--danger)" }}><Trash2 size={14} /></button> */}
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
        <Modal title="Client Details" onClose={() => setModal(null)}>
          <div className="space-y-3 text-[.82rem]">
            {[["Company", selected.company_name], ["Contact", selected.contact_name], ["Email", selected.contact_email], ["Phone", selected.contact_phone], ["Address", selected.address || "—"], ["Contract", selected.contract_type || "—"], ["Budget", selected.monthly_budget ? formatEGP(selected.monthly_budget) : "—"], ["Status", selected.status]].map(([l, v]) => (
              <div key={l as string} className="flex justify-between"><span style={{ color: "var(--fg-muted)" }}>{l}</span><span className="font-medium">{v}</span></div>
            ))}
          </div>
        </Modal>
      )}

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "edit" ? "Edit Client" : "New B2B Client"} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {[["company_name", "Company Name"], ["contact_name", "Contact Name"], ["contact_email", "Email"], ["contact_phone", "Phone"], ["address", "Address"], ["contract_type", "Contract Type"], ["monthly_budget", "Monthly Budget (EGP)"]].map(([k, l]) => (
              <div key={k}><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>{l}</label>
                <input style={inputStyle} className="w-full" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
            <div><label className="text-[.72rem] font-semibold block mb-1" style={{ color: "var(--fg-muted)" }}>Status</label>
              <select style={inputStyle} className="w-full" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {["prospect", "active", "inactive"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-2"><BtnPrimary onClick={save}>{modal === "edit" ? "Update" : "Create"}</BtnPrimary><BtnOutline onClick={() => setModal(null)}>Cancel</BtnOutline></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
